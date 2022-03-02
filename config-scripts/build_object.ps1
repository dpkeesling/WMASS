# Powershell script

function main {
    $object = New-Object -TypeName psobject
    $temp = get-userinput('name of the new map object')
    $object | Add-Member -MemberType NoteProperty -Name text -Value "${temp}"
    $temp = get-userinput('file path to the icon image file')
    $object | Add-Member -MemberType NoteProperty -Name imgpath -Value "${temp}"
    $object | Add-Member -MemberType NoteProperty -Name iconsize -Value ''
    while($true) {
        $object.iconsize = get-userinput("the icon's length and width in pixels, formatted in ##,## format")
        if($object.iconsize -match '^\d+,\d+$') {
            break
        }
        Write-Output "Invalid format."
    }

    $object | Add-Member -MemberType NoteProperty -Name iconanchor -Value ''
    while($true) {
        $object.iconanchor = get-userinput("the coordinates of the icon's anchor point, formatted in ##,## format")
        if($object.iconanchor -match '^-?\d+,-?\d+$') {
            break
        }
        Write-Output "Invalid format."
    }

    $object | Add-Member -MemberType NoteProperty -Name popupanchor -Value ''
    while($true) {
        $object.popupanchor = get-userinput("the coordinates of the popup's anchor point, formatted in ##,## format")
        if($object.popupanchor -match '^-?\d+,-?\d+$') {
            break
        }
        Write-Output "Invalid format."
    }

    $arr = get-additionalproperties
    foreach ($additionprop in $arr) {
        $object | Add-Member -MemberType NoteProperty -Name $additionprop.propertyname -Value $additionprop.propertyvalue
    }

    write-tojson($object)

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
        return ($answer -eq 'Y') -or ($answer -eq 'y')
    }
    else {
        write-output "The string is ${inputlength} characters, which is too long"
    }
}

function get-additionalproperties {
    $additionproperties = @()
    while($true) {
        $object = New-Object -TypeName psobject
        $temp = Read-Host "Enter the name of an additional property you would like to add. If you have no more properties, type 'exit'"
        $object | Add-Member -MemberType NoteProperty -Name propertyname -Value $temp
        if ($object.propertyname -eq 'exit') {
            break
        }
        if (test-userinput($object.propertyname)) {
            $temp = Read-Host "Enter the initial value for this property"
            $object | Add-Member -MemberType NoteProperty -Name propertyvalue -Value $temp
            if (test-userinput($object.propertyvalue)) {
                $additionproperties += $object
            }
        }
    }
    return $additionproperties    
}


function write-tojson ($object) {
    Write-Output $object
    # $jsonfile = Get-Content "..\objects.json"
    # $jsonfile[0..($jsonfile.length-2)] | Out-File "..\objects.json" -Force
    $outputstring = ",`n`t`"$($object.text)`":{`n`t`t`"imgPath`": `"$($object.imgpath)`",`n`t`t`"iconSize`": [$($object.iconsize)],`n`t`t`"iconAnchor`": [$($object.iconanchor)],`n`t`t`"popupAnchor`": [$($object.popupanchor)]"
    $counter = 0
    foreach($object_properties in $object.PsObject.Properties)
    {
        if($counter -le 4) {
            continue
        }
        # Access the name of the property
        $outputstring += ",`n`t`t`"$($object_properties.Name)`":`"$($object_properties.Value)`""
        # TODO: Need to check if this property is the end of the object. If so, don't add a comma and close off
        # Object with a }
        
        $counter += 1
    }
#     Add-Content -Path ..\objects.json -Value 

}

main