import React, { PropTypes } from 'react'; // eslint-disable-line
import FilterGroup from './FilterGroup';

export function initialFilterState(config) {
  const state = {};

  config.map((group) => {
    group.fields.map((field) => {
      state[`${group.name}.${field[0]}`] = field[1];
    });
  });

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
        names={group.fields.map(x => x[0])}
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
        PropTypes.array.isRequired,
      ).isRequired,
    }),
  ).isRequired,
  filters: PropTypes.object.isRequired,
  onChangeFilter: PropTypes.func.isRequired,
};

export default FilterGroups;
