import React from 'react';
import { Component } from 'react';
import { connect } from '@folio/stripes-connect';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';

import MaterialTypesList from './MaterialTypesList'

class MaterialTypesSettings extends React.Component { 
  
  static manifest = Object.freeze({
    materialTypes: {
      type: 'okapi',
      path: 'material-type',
      records: 'mtypes',
      PUT: {
        path: 'material-type/${activeRecord.id}',
      },
      DELETE: {
        path: 'material-type/${activeRecord.id}'
      }
    },
    activeRecord: {}
  });

  constructor(props){
    super(props);
    
    this.state = {}
    
    this.onCreateType = this.onCreateType.bind(this);
    this.onUpdateType = this.onUpdateType.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
  }
  
  onCreateType(type) {
    
  }
  
  onUpdateType(type) {
    
  }
  
  onDeleteType(type) {
    
  }
  
  render() {
    
    const suppressor = {
      // If a suppressor returns true, the control for that action will not appear
      delete: (type) => { return (!type.inUse) }, 
      edit: type => false,                      
    }
    
    return (
      <Paneset>
        <Pane defaultWidth="fill" >
          <MaterialTypesList
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={this.props.data.materialTypes || []}
            label="Material Types"
            createButtonLabel="+ Add type"
            visibleFields={['name']}
            itemTemplate={{name:'string', inUse:'bool'}}
            actionSuppression={suppressor}
            onUpdate={this.onUpdateType}
            onCreate={this.onCreateType}
            onDelete={this.onDeleteType}
            isEmptyMessage="There are no Material Types"
          />
        </Pane>
      </Paneset>
    );
  }
  
}

export default connect(MaterialTypesSettings, '@folio/ui-items');