Set-Location -Path .\frontend
npm run build
Set-Location -Path ..
if (Test-Path -Path .\gui) {
    <# Action to perform if the condition is true #>
    Remove-Item -Path .\gui -Recurse -Force
}
Move-Item -Path .\frontend\build -Destination .\gui

python .\pwdManager.py