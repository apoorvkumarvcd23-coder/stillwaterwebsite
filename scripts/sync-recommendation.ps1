[CmdletBinding()]
param(
    [string]$UpstreamBranch = "main",
    [string]$MainBranch = "main",
    [switch]$SkipDocker,
    [switch]$SkipPush,
    [string]$CheckpointMessage
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][scriptblock]$Action
    )

    Write-Host "\n==> $Label" -ForegroundColor Cyan
    & $Action
}

function Assert-CleanNestedRepo {
    $nestedStatus = git -C Recommendation_Website status --porcelain
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to read Recommendation_Website status."
    }
    if ($nestedStatus) {
        throw "Recommendation_Website has uncommitted changes. Commit/stash there first, then rerun."
    }
}

Invoke-Step -Label "Resolve repository root" -Action {
    $repoRoot = (git rev-parse --show-toplevel).Trim()
    if (-not $repoRoot) {
        throw "Current directory is not a git repository."
    }
    Set-Location $repoRoot
    Write-Host "Repo root: $repoRoot"
}

Invoke-Step -Label "Sanity-check remotes" -Action {
    git remote -v
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read git remotes."
    }
}

Invoke-Step -Label "Validate nested Recommendation_Website repo" -Action {
    if (-not (Test-Path "Recommendation_Website\.git")) {
        throw "Recommendation_Website nested git repo not found."
    }
    git -C Recommendation_Website remote -v
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read nested repo remote."
    }
    Assert-CleanNestedRepo
}

Invoke-Step -Label "Checkpoint current work (if needed)" -Action {
    $mainStatus = git status --porcelain
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read main repo status."
    }

    if (-not $mainStatus) {
        Write-Host "Main repo clean, no checkpoint commit needed." -ForegroundColor DarkGray
        return
    }

    $msg = $CheckpointMessage
    if ([string]::IsNullOrWhiteSpace($msg)) {
        $msg = "chore: checkpoint before Recommendation_Website sync $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }

    git add -A
    git commit -m $msg
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create checkpoint commit."
    }
}

Invoke-Step -Label "Pull latest Recommendation_Website" -Action {
    git -C Recommendation_Website fetch origin $UpstreamBranch
    if ($LASTEXITCODE -ne 0) {
        throw "Fetch failed for Recommendation_Website/$UpstreamBranch."
    }

    git -C Recommendation_Website pull --ff-only origin $UpstreamBranch
    if ($LASTEXITCODE -ne 0) {
        throw "Fast-forward pull failed for Recommendation_Website/$UpstreamBranch."
    }

    Assert-CleanNestedRepo
    $script:RecommendationHead = (git -C Recommendation_Website rev-parse --short HEAD).Trim()
    Write-Host "Recommendation_Website HEAD: $script:RecommendationHead" -ForegroundColor Green
}

Invoke-Step -Label "Show changed files in main repo" -Action {
    git status --short Recommendation_Website
}

if (-not $SkipDocker) {
    Invoke-Step -Label "Run Docker validation" -Action {
        docker compose build
        if ($LASTEXITCODE -ne 0) {
            throw "docker compose build failed."
        }

        docker compose up -d
        if ($LASTEXITCODE -ne 0) {
            throw "docker compose up -d failed."
        }

        if (Test-Path "scripts\smoke-test.ps1") {
            & ".\scripts\smoke-test.ps1"
            if ($LASTEXITCODE -ne 0) {
                throw "Smoke test failed."
            }
        } else {
            Write-Host "scripts/smoke-test.ps1 not found, skipping smoke tests." -ForegroundColor Yellow
        }
    }
}

Invoke-Step -Label "Commit Recommendation_Website snapshot" -Action {
    git add Recommendation_Website
    $staged = git diff --cached --name-only
    if (-not $staged) {
        Write-Host "No Recommendation_Website changes to commit." -ForegroundColor Yellow
        return
    }

    $syncHash = if ($script:RecommendationHead) { $script:RecommendationHead } else { "unknown" }
    $commitMsg = "chore(sync): Recommendation_Website -> $syncHash"

    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit Recommendation_Website sync snapshot."
    }
}

if (-not $SkipPush) {
    Invoke-Step -Label "Push to origin" -Action {
        git push origin HEAD:$MainBranch
        if ($LASTEXITCODE -ne 0) {
            throw "Push failed to origin/$MainBranch."
        }
    }
}

Write-Host "\nSync workflow completed successfully." -ForegroundColor Green
