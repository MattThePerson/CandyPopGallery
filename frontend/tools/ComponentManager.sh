#!/bin/bash
# Bash script utiltiy for managing React Components (in VSCode)
# By Matt Stirling

OPTIONS="[create, list, script, styles]"

cd "$(dirname "$0")"
cd ../src/components

if [ -z "$1" ]; then
    echo "No option passed, chose between $OPTIONS"
    exit 1
fi
OPTION="$1"

if [ $OPTION != "list" ] && [ -z "$2" ]; then
    echo "Please pass a component name"
    exit 1
fi
CNAME="$2"

if [ $OPTION = "list" ]; then # LIST
    echo "Listing components:"
    ls -l

elif [ $OPTION = "script" ]; then # SCRIPT
    FN="$CNAME/$CNAME".tsx
    if [ -f $FN ]; then
        echo "Opening script: '$FN' ..."
        code $FN
    else
        echo "No such component: '$CNAME'"
    fi

elif [ $OPTION = "styles" ]; then # STYLES
    FN="$CNAME/$CNAME".css
    if [ -f $FN ]; then
        echo "Opening styles: '$FN' ..."
        code $FN
    else
        echo "No such component: '$CNAME'"
    fi

elif [ $OPTION = "create" ]; then # CREATE
    if [ -d $CNAME ]; then
        echo "Component '$CNAME' exists"
        cd $CNAME
    else
        mkdir $CNAME
        cd $CNAME
        echo "export { default } from './$CNAME.tsx';" > index.tsx

    # CSS File
        cat <<EOF > $CNAME.css

.$CNAME {
    display: inline;
}
EOF

# JS File
    cat <<EOF > $CNAME.tsx
import './$CNAME.css';


function $CNAME() {

    return (
        <div className="$CNAME">
        </div>
    )
}

export default $CNAME;
EOF
        echo "Component '$CNAME' created"

    fi


    if [ "$3" == "open" ]; then
        code $CNAME.tsx
    fi

else
    echo "Unrecognized option '$OPTION', please select from $OPTIONS"
fi
