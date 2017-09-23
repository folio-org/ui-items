import React from 'react';
import PropTypes from 'prop-types';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-flexbox-grid';

const data = [
            { id: 'isbn', name: 'ISBN' },
            { id: 'issn', name: 'ISSN' },
            { id: '0003', name: 'Standard Technical Report number' },
            { id: '0004', name: 'Publisher Number' },
            { id: '0005', name: 'CODEN' },
            { id: '0006', name: 'Control Number (001)' },
            { id: '0007', name: 'GPO Item Number' },
            { id: 'lccn', name: 'LCCN' },
            { id: '0009', name: 'System Control Number' },
            { id: '0010', name: 'Other Standard Identifier' },
            { id: 'asin', name: 'ASIN' },
            { id: 'UkMaC', name: 'UkMac' },
            { id: 'StEdNL', name: 'StEdNL' },
            { id: 'bnb', name: 'BNB' },
            { id: '0015', name: 'OCLC' },
];

const identifierTypes = {
  selectOptions: selected => data.map(
    it => ({
      label: it.name,
      value: it.id,
      selected: it.id === selected,
    })),

  typeById: id => data.find(it => it.id === id),
};

class ItemInstance extends React.Component {

  static manifest = Object.freeze({
    instance: {
      type: 'okapi',
      path: 'inventory/instances/!{instanceid}',
    },
  });

  identifiersFormatter = (r) => {
    let formatted = '';
    if (r.identifiers && r.identifiers.length) {
      for (let i = 0; i < r.identifiers.length; i += 1) {
        const id = r.identifiers[i];
        const type = identifierTypes.typeById(id.namespace);
        formatted += (i > 0 ? ', ' : '') +
                     id.value +
                     (type ? ` (${type.name})` : '');
      }
    }
    return formatted;
  };

  render() {
    const { resources: { instance } } = this.props;
    if (!instance || !instance.hasLoaded || !instance.records) return <div />;
    const inst = instance.records[0];

    return (
      <div>
        <h3>Instance</h3>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Title" value={inst.title} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <KeyValue label="Identifiers" value={this.identifiersFormatter(inst)} />
          </Col>
        </Row>
      </div>
    );
  }
}

ItemInstance.propTypes = {
  resources: PropTypes.shape({
    instances: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }),
};

export default ItemInstance;
