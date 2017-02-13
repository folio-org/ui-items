import React, { PropTypes } from 'react'; // eslint-disable-line
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup'; // eslint-disable-line
import FilterCheckbox from './FilterCheckbox';

class FilterGroup extends React.Component {
  render() {
    const { label, group, names, filters, onChangeFilter } = this.props;

    return <FilterControlGroup label={label}>
      {names.map((name, index) =>
                 <FilterCheckbox key={index} group={group} name={name}
                 onChangeFilter={onChangeFilter}
                 checked={!!filters[`${group}.${name}`]} />)}
    </FilterControlGroup>
  }
}

export default FilterGroup;
