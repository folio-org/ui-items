import React, { PropTypes } from 'react'; // eslint-disable-line
import FilterGroup from './FilterGroup';

export function initialFilterState(config, query) {
  const state = {};

  for (const group of config) {
    for (const field of group.fields) {
      const fullName = `${group.name}.${field}`;
      if (query[fullName]) state[fullName] = true;
    }
  }

  return state;
}


const FilterGroups = (props) => {
  const { config, filters, onChangeFilter } = props;

  return (<span>
    {config.map((group, index) =>
      <FilterGroup
        key={index}
        label={group.label}
        groupName={group.name}
        names={group.fields}
        filters={filters} onChangeFilter={onChangeFilter}
      />)
    }
  </span>);
};

FilterGroups.propTypes = {
  config: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(
        PropTypes.string.isRequired,
      ).isRequired,
    }),
  ).isRequired,
  filters: PropTypes.object.isRequired,
  onChangeFilter: PropTypes.func.isRequired,
};

export default FilterGroups;
