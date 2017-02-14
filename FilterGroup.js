import React, { PropTypes } from 'react'; // eslint-disable-line
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup'; // eslint-disable-line
import FilterCheckbox from './FilterCheckbox';

const FilterGroup = (props) => {
  const { label, groupName, names, filters, onChangeFilter } = props;

  return (<FilterControlGroup label={label}>
    {names.map((name, index) =>
      <FilterCheckbox
        key={index} groupName={groupName} name={name}
        onChangeFilter={onChangeFilter}
        checked={!!filters[`${groupName}.${name}`]}
      />)}
  </FilterControlGroup>);
};

FilterGroup.propTypes = {
  label: PropTypes.string.isRequired,
  groupName: PropTypes.string.isRequired,
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  filters: PropTypes.object.isRequired,
  onChangeFilter: PropTypes.func.isRequired,
};

export default FilterGroup;
