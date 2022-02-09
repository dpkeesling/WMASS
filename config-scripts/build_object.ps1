# Powershell script

function main {
    $objectname = get-userinput("name of the new map object")
    $imgpath = get-userinput("file path to the icon's image file")
    $iconsize = ""
    while($true) {
        $iconsize = get-userinput("the icon's length and width in pixels, formatted in ##,## format")
        if($iconsize -match '^\d+,\d+$') {
            break
        }
        Write-Output "Invalid format."
    } 

    $iconanchor = ""
    while($true) {
        $iconanchor = get-userinput("the coordinates of the icon's anchor point, formatted in ##,## format")
        if($iconanchor -match '^\d+,\d+$') {
            break
        }
        Write-Output "Invalid format."
    }
}

function get-userinput ($promptstring) {
    while ($true) {
        $objectname = Read-Host "Enter the ${promptstring}. Must be less than 256 characters"
        $inputcheck = test-userinput($objectname)
        if ($inputcheck) {
            return $objectname
        }
    }
}

function test-userinput($userinput) {
    $inputlength = $userinput | measure-object -character | Select-Object -expandproperty characters
    if ($inputlength -lt 256) {
        $answer = Read-Host "You have entered: ${userinput}. Is this correct? (Y/N)"
        if (($answer -eq 'Y') -or ($answer -eq 'y')) {
            return $true
        }
        else {
            return $false
        }
    }
    else {
        write-output "The string is ${inputlength} characters, which is too long"
    }
}


function write-tojson () {
    $jsonfile = '../objects.json'

    $json = Get-Content $jsonfile | Out-String | ConvertFrom-Json

    $json | Add-Member -Type NoteProperty -Name 'newKey1' -Value 'newValue1'
    $json | Add-Member -Type NoteProperty -Name 'newKey2' -Value 'newValue2'

    $json | ConvertTo-Json | Set-Content $jsonfile
}

main