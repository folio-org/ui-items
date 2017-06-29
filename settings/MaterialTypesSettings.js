import React, { PropTypes } from 'react';
import AuthorityList from './AuthorityList';

class MaterialTypesSettings extends React.Component {
  constructor(props) {
    super(props);
    this.connectedAuthorityList = props.stripes.connect(AuthorityList);
  }

  render() {
    return (<this.connectedAuthorityList
            {...this.props}
            baseUrl="material-types"
            records="mtypes"
            label="Material Types" />);
  }
}

export default MaterialTypesSettings;
