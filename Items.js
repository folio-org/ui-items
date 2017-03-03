import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Match from 'react-router/Match';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup';
import Layer from '@folio/stripes-components/lib/Layer';
import FilterGroups, { initialFilterState, filters2cql, onChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';

import ItemForm from './ItemForm';
import ViewItem from './ViewItem';

const filterConfig = [
  {
    label: 'Item Types',
    name: 'item',
    cql: 'materialType',
    values: [
      { name: 'Books', cql: 'Book' },
      { name: 'DVDs', cql: 'DVD' },
      'Microfilm',
    ],
  }, {
    label: 'Location',
    name: 'location',
    cql: 'location.name',
    values: ['Main Library', 'Annex Library'],
  },
];

class Items extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object,
  };

  static propTypes = {
    data: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      query: PropTypes.object, // object of key=value pairs
      search: PropTypes.string, // string combining all parts of query
    }).isRequired,
    mutator: PropTypes.shape({
      addItemMode: PropTypes.shape({
        replace: PropTypes.func,
      }),
      items: PropTypes.shape({
        POST: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    addItemMode: {},
    items: {
      type: 'okapi',
      records: 'items',
      path: (queryParams, _pathComponents, _resourceValues) => {
        const { query, filters, sort } = queryParams || {};

        let cql;
        if (query) {
          cql = `materialType="${query}" or barcode="${query}*" or title="${query}*"`;
        }

        const filterCql = filters2cql(filterConfig, filters);
        if (filterCql) {
          if (cql) {
            cql = `(${cql}) and ${filterCql}`;
          } else {
            cql = filterCql;
          }
        }

        if (sort) {
          if (cql === undefined) cql = 'materialType=*';
          cql += ` sortby ${sort}`;
        }

        let path = 'item-storage/items';
        if (cql) path += `?query=${encodeURIComponent(cql)}`;

        console.log(`query=${query} filters=${filters} sort=${sort} -> ${path}`);
        return path;
      },
      staticFallback: { path: 'item-storage/items' },
    },
  });

  constructor(props) {
    super(props);

    const query = props.location.query || {};
    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: {},
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
    };
    props.mutator.addItemMode.replace({ mode: false });

    this.onClearSearch = this.onClearSearch.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
    this.onClickAddNewItem = this.onClickAddNewItem.bind(this);
    this.onClickCloseNewItem = this.onClickCloseNewItem.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);

    this.onChangeFilter = onChangeFilter.bind(this);
    this.transitionToParams = transitionToParams.bind(this);
  }

  onChangeSearch(e) {
    const query = e.target.value;
    this.props.logger.log('action', `searched for '${query}'`);

    this.setState({ searchTerm: query });
    this.transitionToParams({ query });
  }

  onClearSearch() {
    this.props.logger.log('action', 'cleared search');
    this.setState({ searchTerm: '' });
    this.context.router.transitionTo(this.props.location.pathname);
  }

  onSort(e, meta) {
    const sortOrder = meta.name;
    this.props.logger.log('action', `sorted by ${sortOrder}`);
    this.setState({ sortOrder });
    this.transitionToParams({ sort: sortOrder });
  }

  // Results Handler
  // row selection handler
  onSelectRow(e, meta) {
    const itemId = meta.id;
    this.props.logger.log(`clicked ${itemId}, location =`, this.props.location, 'selected item =', meta);
    this.setState({ selectedItem: meta });
    this.context.router.transitionTo(`/items/view/${itemId}${this.props.location.search}`);
  }

  // AddItem Handlers
  onClickAddNewItem(e) {
    if (e) e.preventDefault();
    this.props.logger.log('action', 'clicked "add new item"');
    this.props.mutator.addItemMode.replace({ mode: true });
  }

  onClickCloseNewItem(e) {
    if (e) e.preventDefault();
    this.props.logger.log('action', 'clicked "close new item"');
    this.props.mutator.addItemMode.replace({ mode: false });
  }

  create(data) {
    // POST item record
    this.props.logger.log('action', `Creating new item record: ${JSON.stringify(data)}`);
    this.props.mutator.items.POST(data);
    this.onClickCloseNewItem();
  }

  updateFilters(filters) { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  render() {
    const { data, pathname } = this.props;
    const items = data.items || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;

    const resultsFormatter = {
      materialType: x => _.get(x, ['materialType', 'name']),
      location: x => _.get(x, ['location', 'name']),
    };

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
          <FilterControlGroup label="Actions">
            <Button fullWidth onClick={this.onClickAddNewItem}>New item</Button>
          </FilterControlGroup>
        </Pane>
        {/* Results Pane */}
        <Pane
          defaultWidth="40%"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Results</strong>
              <div>
                <em>{items.length} Result{items.length === 1 ? '' : 's'} Found</em>
              </div>
            </div>
          }
          lastMenu={resultMenu}
        >
          <MultiColumnList
            contentData={items}
            selectedRow={this.state.selectedItem}
            rowMetadata={['title', 'id']}
            headerMetadata={{ title: { _id: '001' } }}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            visibleColumns={['materialType', 'location', 'barcode', 'title']}
            fullWidth
            sortOrder={this.state.sortOrder}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
          />
        </Pane>

        {/* Details Pane */}
        <Match pattern={`${pathname}/view/:itemid`} render={props => <ViewItem placeholder={'placeholder'} {...props} />} />
        <Layer isOpen={data.addItemMode ? data.addItemMode.mode : false} label="Add New Item Dialog">
          <ItemForm
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewItem}
          />
        </Layer>

      </Paneset>
    );
  }
}

export default Items;
