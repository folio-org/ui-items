import React, { PropTypes } from 'react';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class MaterialTypesSettings extends React.Component {
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
        baseUrl="material-types"
        records="mtypes"
        label="Material Types"
      />
    );
  }
}

export default MaterialTypesSettings;
