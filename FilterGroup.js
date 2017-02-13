import React, { PropTypes } from 'react'; // eslint-disable-line
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup'; // eslint-disable-line
import FilterCheckbox from './FilterCheckbox';

const FilterGroup = (props) => {
  const { label, group, names, filters, onChangeFilter } = props;

  return (<FilterControlGroup label={label}>
    {names.map((name, index) =>
      <FilterCheckbox
        key={index} group={group} name={name}
        onChangeFilter={onChangeFilter}
        checked={!!filters[`${group}.${name}`]}
      />)}
  </FilterControlGroup>);
};

FilterGroup.propTypes = {
  label: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  filters: PropTypes.object.isRequired,
  onChangeFilter: PropTypes.func.isRequired,
};

export default FilterGroup;