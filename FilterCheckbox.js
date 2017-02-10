import React, { PropTypes } from 'react'; // eslint-disable-line
import Checkbox from '@folio/stripes-components/lib/Checkbox'; // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon'; // eslint-disable-line

class FilterCheckbox extends React.Component {
  render() {
    const { group, name, filters, onChangeFilter } = this.props;
    const fullName = `${group}.${name}`;

    return <Checkbox
      id={`${fullName}-ItemFilter`}
      label={name}
      name={fullName}
      checked={!!filters[fullName]}
      onChange={onChangeFilter}
      marginBottom0
      hover
      fullWidth
      checkedIcon={<Icon icon="eye" />}
    />
  }
}

export default FilterCheckbox;
