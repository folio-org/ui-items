import React, { PropTypes } from 'react';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class LoanTypesSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    return (
      <this.connectedControlledVocab
        {...this.props}
        baseUrl="loan-types"
        records="loantypes"
        label="Loan Types"
      />
    );
  }
}

export default LoanTypesSettings;
