$ErrorActionPreference='Stop'
$cache=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../data/tour-import-cache'))
$source=Get-Content -LiteralPath 'C:/Users/KBU/Documents/카카오톡 받은 파일/tour.final.json' -Raw | ConvertFrom-Json
$lookup=@{}
Get-ChildItem -LiteralPath $cache -Filter 'index-*.json' | ForEach-Object {
  foreach($r in (Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json)){
    $key=$r.title -replace '\s',''
    if(!$lookup.ContainsKey($key)){$lookup[$key]=[Collections.Generic.List[object]]::new()}
    $lookup[$key].Add($r)
  }
}
$targets=@(foreach($item in $source){
  if($item.contenttypeid -ne 12){continue}
  $key=$item.title -replace '\s',''
  foreach($r in $lookup[$key]){if($r){$r}}
})
$targets=@($targets | Sort-Object url -Unique)
"Matched detail targets: $($targets.Count)"
$targets | ForEach-Object -Parallel {
  $target=$_
  $id=[IO.Path]::GetFileNameWithoutExtension(([uri]$target.url).AbsolutePath)
  $file=Join-Path $using:cache "detail-$id.json"
  if(Test-Path -LiteralPath $file){return}
  function Clean([string]$s){
    $s=[regex]::Replace($s,'<br\s*/?>',"`n",'IgnoreCase')
    $s=[regex]::Replace($s,'<[^>]+>','')
    $s=[Net.WebUtility]::HtmlDecode($s)
    return ([regex]::Replace($s,'[\t\r ]+',' ').Trim())
  }
  try {
    $html=(Invoke-WebRequest -Uri $target.url -TimeoutSec 25).Content
    $section=[regex]::Match($html,'<div class="single-post-content">([\s\S]*?)<h2>위치</h2>')
    if(!$section.Success){throw 'Detail section missing'}
    $body=$section.Groups[1].Value
    $fields=@{}
    foreach($m in [regex]::Matches($body,'<span class=["'']sub-name["'']>([^<]+)</span>([\s\S]*?)(?=<span class=|</p>)')){
      $fields[(Clean $m.Groups[1].Value)]=(Clean $m.Groups[2].Value).TrimStart(' ',':').Trim()
    }
    $intro=Clean ([regex]::Match($body,'<h2>설명</h2>\s*<p>([\s\S]*?)</p>').Groups[1].Value)
    $address=Clean ([regex]::Match($html,'<h2>위치</h2>\s*<p>([\s\S]*?)</p>').Groups[1].Value)
    $images=@([regex]::Matches($html,'(?:src|content)=["''](https?://tong\.visitkorea\.or\.kr/cms/resource/[^"'']+)["'']') | ForEach-Object {$_.Groups[1].Value})
    $result=@{title=$target.title;url=$target.url;address=$address;fields=$fields;intro=$intro;images=$images;checkedAt=(Get-Date -Format 'yyyy-MM-dd')}
    [IO.File]::WriteAllText($file,(ConvertTo-Json -InputObject $result -Depth 8 -Compress))
  } catch {Write-Output "Failed detail $id"}
} -ThrottleLimit 6
"Detail files: $(@(Get-ChildItem -LiteralPath $cache -Filter 'detail-*.json').Count)"
