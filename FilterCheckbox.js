import React, { PropTypes } from 'react'; // eslint-disable-line
import Checkbox from '@folio/stripes-components/lib/Checkbox'; // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon'; // eslint-disable-line

class FilterCheckbox extends React.Component {
  render() {
    const { group, name, isActiveFilter, filters, onChangeFilter } = this.props;

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