import React from 'react';
import { Component } from 'react';
import { connect } from '@folio/stripes-connect';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';

class MaterialTypesSettings extends React.Component { 
  
  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <p>Boo!</p>
    )
  }
  
}

export default connect(MaterialTypesSettings, '@folio/ui-items');