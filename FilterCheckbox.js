import React, { PropTypes } from 'react'; // eslint-disable-line
import Checkbox from '@folio/stripes-components/lib/Checkbox'; // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon'; // eslint-disable-line

// determines whether filter checkboxes are checked.
function isActiveFilter(name, arr) {
  const ind = arr.indexOf(name);
  return ind !== -1;
}

class FilterCheckbox extends React.Component {
  render() {
    const { group, name, filters, onChangeFilter } = this.props;

    return <Checkbox
      id={`${name}ItemFilter`}
      label={name}
      name={name}
      checked={isActiveFilter(name, filters)}
      onChange={onChangeFilter}
      marginBottom0
      hover
      fullWidth
      checkedIcon={<Icon icon="eye" />}
    />
  }
}

export default FilterCheckbox;
