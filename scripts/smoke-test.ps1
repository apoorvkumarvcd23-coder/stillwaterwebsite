#!/usr/bin/env pwsh
# smoke-test.ps1
# Local Docker smoke-test suite for the Stillwater stack.
# Run AFTER: docker compose up --build -d
# Usage:  .\scripts\smoke-test.ps1

$ErrorActionPreference = 'Stop'
$base       = 'http://localhost:3005'
$backendDirect = 'http://localhost:3006'
$pass = 0
$fail = 0

function Assert-Http {
    param(
        [string]$Label,
        [string]$Url,
        [string]$Method = 'GET',
        [hashtable]$Body = $null,
        [int]$ExpectStatus = 200,
        [string]$ExpectBodyContains = ''
    )
    try {
        $params = @{ Uri = $Url; Method = $Method; TimeoutSec = 15 }
        if ($Body) {
            $params.Body        = ($Body | ConvertTo-Json -Compress)
            $params.ContentType = 'application/json'
        }
        $resp = Invoke-WebRequest @params -UseBasicParsing
        $ok   = $resp.StatusCode -eq $ExpectStatus
        if ($ExpectBodyContains -and $resp.Content -notmatch [regex]::Escape($ExpectBodyContains)) {
            $ok = $false
        }
        if ($ok) {
            Write-Host "  PASS  $Label" -ForegroundColor Green
            $script:pass++
        } else {
            Write-Host "  FAIL  $Label  [HTTP $($resp.StatusCode)] body: $($resp.Content.Substring(0,[Math]::Min(200,$resp.Content.Length)))" -ForegroundColor Red
            $script:fail++
        }
    } catch {
        Write-Host "  FAIL  $Label  [$($_.Exception.Message)]" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "`n=== Stillwater Smoke Tests ===" -ForegroundColor Cyan

# ── 1. Service health endpoints ────────────────────────────────────────────────
Write-Host "`n[1] Health endpoints"
Assert-Http -Label 'main-website /api/funds'                 -Url "$base/api/funds"
Assert-Http -Label 'recommendation-backend /health (direct)' -Url "$backendDirect/health" -ExpectBodyContains '"ok"'
Assert-Http -Label 'recommendation-backend /health (proxy)'  -Url "$base/recommendation/api/health" -ExpectBodyContains '"ok"'

# ── 2. Proxy routing ──────────────────────────────────────────────────────────
Write-Host "`n[2] Proxy routing"
Assert-Http -Label 'recommendation-frontend / via proxy'     -Url "$base/recommendation"
try {
    $page = Invoke-WebRequest -Uri "$base/recommendation" -UseBasicParsing -TimeoutSec 15
    if ($page.Content -match '/recommendation/_next/') {
        Write-Host "  PASS  /recommendation/_next assets referenced via proxy" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  FAIL  /recommendation/_next assets referenced via proxy  [asset path not found in HTML]" -ForegroundColor Red
        $script:fail++
    }
} catch {
    Write-Host "  FAIL  /recommendation/_next assets referenced via proxy  [$($_.Exception.Message)]" -ForegroundColor Red
    $script:fail++
}

# ── 3. Assessment submit ──────────────────────────────────────────────────────
Write-Host "`n[3] Assessment API"
$assessment = @{
    age = 30; gender = 'female'; height = 165; weight = 65
    occupation_type = 'desk'; screen_time_hours = 8; sleep_hours = 6
    stress_level = 8; water_intake = 'low'; exercise_frequency = 'rarely'
    diet_type = 'omnivore'; alcohol_frequency = 'weekly'; smoking = 'no'
    processed_food_frequency = 'daily'; sugar_intake = 'high'; dairy_consumption = 'daily'
    conditions = @('Anxiety', 'Eye strain'); symptoms = @('tired eyes', 'insomnia'); goals = @('lose weight', 'increase energy')
}
$assessmentResp = $null
try {
    $r = Invoke-WebRequest -Uri "$base/recommendation/api/assessment" -Method POST `
        -Body ($assessment | ConvertTo-Json -Compress) -ContentType 'application/json' `
        -UseBasicParsing -TimeoutSec 15
    $assessmentResp = $r.Content | ConvertFrom-Json
    if ($assessmentResp.userId) {
        Write-Host "  PASS  POST /api/assessment  [userId=$($assessmentResp.userId)]" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  FAIL  POST /api/assessment  [no userId in response]" -ForegroundColor Red
        $script:fail++
    }
} catch {
    Write-Host "  FAIL  POST /api/assessment  [$($_.Exception.Message)]" -ForegroundColor Red
    $script:fail++
}

# ── 4. Leads submit ───────────────────────────────────────────────────────────
Write-Host "`n[4] Leads API"
if ($assessmentResp -and $assessmentResp.userId) {
    $userId = $assessmentResp.userId
    Assert-Http -Label 'POST /api/leads' `
        -Url "$base/recommendation/api/leads" -Method POST `
        -Body @{ userId = $userId; name = 'Smoke Test'; email = 'smoke@test.local'; phone = '9999999999' } `
        -ExpectBodyContains '"success":true'
} else {
    Write-Host "  SKIP  POST /api/leads  [no userId from previous step]" -ForegroundColor Yellow
}

# ── 5. Recommendation generation ─────────────────────────────────────────────
Write-Host "`n[5] Recommendation generation"
$recResp = $null
if ($assessmentResp -and $assessmentResp.userId) {
    try {
        $r = Invoke-WebRequest -Uri "$base/recommendation/api/recommendation" -Method POST `
            -Body (@{ userId = $assessmentResp.userId } | ConvertTo-Json -Compress) `
            -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30
        $recResp = $r.Content | ConvertFrom-Json
        if ($recResp.primary_recommendation) {
            Write-Host "  PASS  POST /api/recommendation  [primary=$($recResp.primary_recommendation)]" -ForegroundColor Green
            $script:pass++
        } else {
            Write-Host "  FAIL  POST /api/recommendation  [no primary_recommendation in response]" -ForegroundColor Red
            $script:fail++
        }
    } catch {
        Write-Host "  FAIL  POST /api/recommendation  [$($_.Exception.Message)]" -ForegroundColor Red
        $script:fail++
    }
} else {
    Write-Host "  SKIP  POST /api/recommendation" -ForegroundColor Yellow
}

# ── 6. Results retrieval ──────────────────────────────────────────────────────
Write-Host "`n[6] Results retrieval"
if ($assessmentResp -and $assessmentResp.userId) {
    Assert-Http -Label "GET /api/recommendation/:userId" `
        -Url "$base/recommendation/api/recommendation/$($assessmentResp.userId)" `
        -ExpectBodyContains 'primary_recommendation'
} else {
    Write-Host "  SKIP  GET /api/recommendation/:userId" -ForegroundColor Yellow
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "`n=== Results: $pass passed, $fail failed ===" -ForegroundColor Cyan
if ($fail -gt 0) { exit 1 } else { exit 0 }
