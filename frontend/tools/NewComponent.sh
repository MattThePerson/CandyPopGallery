#!/bin/bash

if [ -z "$1" ]; then
    echo "No component name passed"
    exit 1
fi

cd "$(dirname "$0")"
cd ../src/components

if [ -d $1 ]; then
    echo "Component '$1' exists"
    cd $1
else
    mkdir $1
    cd $1
    echo "export { default } from './$1.tsx';" > index.tsx

# CSS File
    cat <<EOF > $1.css

.$1 {
    display: inline;
}
EOF

# JS File
    cat <<EOF > $1.tsx
import './$1.css';


function $1() {

    return (
        <div className="$1">
        </div>
    )
}

export default $1;
EOF
    echo "Component '$1' created"

fi


if [ "$2" == "open" ]; then
    code $1.tsx
fi