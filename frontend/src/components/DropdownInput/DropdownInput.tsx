import { useState, useEffect } from 'react'

import './DropdownInput.css'


type DropdownInputProps = {
    name: string,
    options: { name: string; amount: number; }[] | null,
    selectedOptions: string[],
    updateSelectedOptions: Function,
}


function DropdownInput({ name, options, selectedOptions, updateSelectedOptions }: DropdownInputProps) {

    // filter the list of options by the string in the input element
    function filterOptions(value: string) {
        if (options) {
            const new_options = options.filter(opt => opt.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredOptions(new_options);
        }
    }

    const component_id = name + '-dropdown-input';
    options?.sort((a, b) => b.amount - a.amount);
    
    const [filteredOptions, setFilteredOptions] = useState(options);

    // show/hide dropdown
    useEffect(() => {
        const component_el = document.getElementById(component_id)!;
        const input_el = component_el.querySelector('input');
        const dropdown_list_el = component_el.querySelector('.dropdown-list');

        input_el?.addEventListener('focus', () =>   dropdown_list_el?.classList.add('show') );
        input_el?.addEventListener('blur', () =>    dropdown_list_el?.classList.remove('show') );
    }, []);
    
    // update filtered options on when options change
    useEffect(() => filterOptions(''), [options]);

    // handle clicking an option in the dropdown list
    function handleSelect(opt: any) {
        document.getElementById(component_id)!.querySelector('ul')?.classList.remove('show');
        const newSelected = [...selectedOptions, opt.name];
        updateSelectedOptions(newSelected);
    }

    // 
    function handleSelectRemove(remove_opt: any) {
        const newSelected = selectedOptions.filter(opt => opt !== remove_opt);
        console.log(newSelected);
        updateSelectedOptions(newSelected);
    }
    
    
    /* RETURN */
    const selectedOptionsEls = selectedOptions?.map((opt, idx) => 
        <li key={'selected-'+idx} onClick={() => handleSelectRemove(opt)}>
            <div className="name">{opt} </div>
        </li>
    )

    const filteredOptionsEls = filteredOptions?.map((opt) => 
        <li key={opt.name+opt.amount} onMouseDown={() => handleSelect(opt)}>   {/* Could be optimized */}
            <div>{opt.name}</div><div>{opt.amount}</div>
        </li>
    )
    
    return (
        <div className="DropdownInput" id={component_id}>
            <div className="name">{name + ` (${options ? options.length : 0})`}</div>
            <ul className="selected-tags">
                {selectedOptionsEls}
            </ul>
            <input id={name + "_input"} type="search" autoComplete="off" onChange={e => filterOptions(e.target.value)} />
            <ul className="dropdown-list">
                { options ? (
                    filteredOptionsEls
                ) : (
                    <div>Loading ...</div>
                )
                }
            </ul>
        </div>
    )
}

export default DropdownInput;