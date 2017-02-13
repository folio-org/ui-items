import React, { PropTypes } from 'react'; // eslint-disable-line
import Checkbox from '@folio/stripes-components/lib/Checkbox'; // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon'; // eslint-disable-line

const FilterCheckbox = (props) => {
  const { group, name, checked, onChangeFilter } = props;
  const fullName = `${group}.${name}`;

  return (<Checkbox
    id={`${fullName}-ItemFilter`}
    label={name}
    name={fullName}
    checked={checked}
    onChange={onChangeFilter}
    marginBottom0
    hover
    fullWidth
    checkedIcon={<Icon icon="eye" />}
  />);
};

export default FilterCheckbox;
