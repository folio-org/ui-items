import React, { PropTypes } from 'react';
import AuthorityList from './AuthorityList';

class LoanTypesSettings extends React.Component {
  constructor(props) {
    super(props);
    this.connectedAuthorityList = props.stripes.connect(AuthorityList);
  }

  render() {
    return (<this.connectedAuthorityList
            {...this.props}
            baseUrl="loan-types"
            records="loantypes"
            label="Loan Types" />);
  }
}

export default LoanTypesSettings;
