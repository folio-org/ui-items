# Change history for ui-items

## IN PROGRESS

* Settings panes are sorted alphabetically. Fixes ui-items bit of STRIPES-358.

## [1.3.0](https://github.com/folio-org/ui-items/tree/v1.3.0) (2017-05-08)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.2.0...v1.3.0)

* Permanent and temporary loan types now viewable and editable in the main UI. Completes LIBAPP-174.

## [1.2.0](https://github.com/folio-org/ui-items/tree/v1.2.0) (2017-05-05)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.1.0...v1.2.0)

* Settings page added for maintaining loan types. Fixes LIBAPP-173.
* Make item detail pane collapsible. Fixes LIBAPP-162.
* Editing an item record no longer leaves the widths of multi-pane display broken. Fixes STRIPES-316.
* Similar fixes to rendering of settings pages. Fixes STRIPES-330.
* Item records with no status are rendered without errors. Fixes STRIPES-318.
* All-records search now works again. Fixes the Items-module part of STRIPES-346.
* Components no longer connect themselves but their callers use curried connect. See STRIPES-338.
* The material-type filters are now populated dynamically from the set of material-types. Fixes STRIPES-287.
* Uses new-style settings API from stripes-core. See STRIPES-197.
* Uses react-router to navigate to pages within settings. Fixes STRIPES-340.
* Requires stripes-core v1.0.0 and stripes-components v0.7.0.

## [1.1.0](https://github.com/folio-org/ui-items/tree/v1.1.0) (2017-04-12)
[Full Changelog](https://github.com/folio-org/ui-items/compare/v1.0.0...v1.1.0)

* Upgrade dependencies; stripes-core v0.6.0, stripes-connect v0.3.0, and stripes-components v0.6.0.

## [1.0.0](https://github.com/folio-org/ui-items/tree/v1.0.0) (2017-04-07)

* First formal release.

