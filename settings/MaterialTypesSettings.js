import React, { PropTypes } from 'react';
import AuthorityList from '@folio/stripes-components/lib/AuthorityList';

class MaterialTypesSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedAuthorityList = props.stripes.connect(AuthorityList);
  }

  render() {
    return (
      <this.connectedAuthorityList
        {...this.props}
        baseUrl="material-types"
        records="mtypes"
        label="Material Types"
      />
    );
  }
}

export default MaterialTypesSettings;
