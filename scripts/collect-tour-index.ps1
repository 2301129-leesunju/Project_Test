param([int]$StartPage=1,[int]$EndPage=1600)
$ErrorActionPreference='Stop'
$cache=Join-Path $PSScriptRoot '../data/tour-import-cache'
New-Item -ItemType Directory -Path $cache -Force | Out-Null
$cache=[IO.Path]::GetFullPath($cache)
$StartPage..$EndPage | ForEach-Object -Parallel {
  $page=$_
  $file=Join-Path $using:cache "index-$page.json"
  if(Test-Path -LiteralPath $file){return}
  try {
    $html=(Invoke-WebRequest -Uri "https://www.koreatriptips.com/tourist-attractions.html?&page=$page" -TimeoutSec 25).Content
    $records=@([regex]::Matches($html,'<h3><a href="(/tourist-attractions/\d+\.html)">([^<]+)</a></h3>') | ForEach-Object {
      @{title=[Net.WebUtility]::HtmlDecode($_.Groups[2].Value);url='https://www.koreatriptips.com'+$_.Groups[1].Value}
    })
    [IO.File]::WriteAllText($file,(ConvertTo-Json -InputObject $records -Compress))
  } catch { Write-Output "Failed page $page" }
} -ThrottleLimit 6
"Index files: $(@(Get-ChildItem -LiteralPath $cache -Filter 'index-*.json').Count)"
