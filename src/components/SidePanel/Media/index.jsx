import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Icon } from 'semantic-ui-react';

import { GetMedia, PromptDeleteFile, DeleteFile, ViewDetails } from '../../../actions';
import { transition } from '../../../helpers';
import { GALLERY_MIN_COL_WIDTH, COLORS, MENU_WIDTH, CONTENT_MAX_WIDTH } from '../../../constants';

import Modal from './Modal';
import Button from './Button';
import Header from './Header';
import FileItem from './FileItem';
import AddCredit from './AddCredit';
import PaymentConfirmed from './PaymentConfirmed';


class Media extends Component {

  componentDidMount = () => {

    if (!this.props.initialized) {

      this.props.GetMedia();
    }

    if (!this.props.mobile) {

      this.container = document.getElementById('sidepanel_scroll_container');
    }
  };

  renderConfirmDeleteModal = () => {

    const { promptDeleteFile, clientWidth, clientHeight, mobile } = this.props;

    if (!promptDeleteFile) { return null; }

    return (
      <Modal
        handleClose={() => this.props.PromptDeleteFile(null)}
        clientHeight={this.props.clientHeight}
        clientWidth={this.props.clientWidth}
        closeOnDimmerClick
        style={{
          border: `1px solid ${COLORS.secondary}`,
          background: COLORS.primary,
          minWidth: Math.min(360, clientWidth),
          maxWidth: clientWidth - 24,
          padding: 24
        }}
        dimmerStyle={{
          left: 'unset',
          right: mobile ? 0 : MENU_WIDTH + 10,
          borderRight: `1px solid ${COLORS.secondary}`,
          zIndex: 9999999999,
          ...(mobile ? {} : {
            height: clientHeight - 48,
            top: 48
          })
        }}
      >
        <div style={{
          marginBottom: 12
        }}>
          <div style={{ color: COLORS.secondaryBright, marginRight: 8, marginBottom: 16, fontSize: 16 }}>
            Confirm Delete
          </div>
          <Icon name='file outline' />
          {promptDeleteFile.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'right', marginTop: 24 }}>
          <Button
            label='CANCEL'
            onClick={() => this.props.PromptDeleteFile(null)}
            style={{
              padding: 8
            }}
          />
          <Button
            label='DELETE'
            pending={promptDeleteFile.pendingDelete}
            onClick={() => this.props.DeleteFile(promptDeleteFile)}
            style={{
              color: COLORS.red,
              marginLeft: 12,
              padding: 8
            }}
          />
        </div>
      </Modal>
    );

  };

  renderViewDetailsModal = () => {

    return null;
  };

  renderAddCreditModal = () => {

    const { clientWidth, clientHeight } = this.props;

    if (!this.props.addCreditModalOpen) { return null; }

    return <AddCredit clientWidth={clientWidth} clientHeight={clientHeight} />;
  };

  renderPaymentConfirmedModal = () => {

    const { clientWidth, clientHeight } = this.props;

    if (!this.props.transactionConfirmed) { return null; }

    return <PaymentConfirmed clientWidth={clientWidth} clientHeight={clientHeight} />;
  };

  renderEmptyContent = () => {

    if (!this.props.initialized || this.props.storageTotal > 0 || this.props.files.length > 0) {
      return null;
    }

    return (
      <div style={{
        height: this.props.clientHeight - 288,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: COLORS.secondaryBright,
        fontSize: 13,
        whiteSpace: 'break-spaces'
      }}>
        <div style={{ maxWidth: Math.min(333, this.props.clientWidth - 72), textAlign: 'center' }}>
          <span>
            Files you upload will appear here.
          </span>
          <span style={{ marginLeft: 7 }}>
            Click "Add Credit" to buy storage with Lightning.
          </span>
        </div>
      </div>
    );
  };

  render = () => {

    const { itemsPerRow, itemWidth, mobile, clientWidth } = this.props;
    const rows = [];

    let compare;

    if (this.props.sort === 'time') {

      compare = (a, b) => {
        return b.created - a.created;
      };

    } else if (this.props.sort === 'size') {

      compare = (a, b) => {
        return b.size - a.size;
      };

    } else if (this.props.sort === 'name') {

      compare = (a, b) => {
        if (!a.name || !b.name) { return 0; }
        return a.name.localeCompare(b.name);
      };
    }

    // Apply filter/sort transformations
    const files = (this.props.query ? this.props.files.filter(file => {
      if (!file.name) { return false; }
      return file.name.toLowerCase().indexOf(this.props.query.toLowerCase()) !== -1;
    }) : this.props.files).sort(compare);

    for (let i = 0; i < files.length; i++) {

      const row = Math.floor(i / itemsPerRow);
      const file = files[i];

      if (!rows[row]) {
        rows[row] = [ file ];
      } else {
        rows[row].push(file);
      }
    }

    return (
      <div style={{
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: 120
      }}>
        <Header clientWidth={clientWidth} />
        <div style={{
          paddingTop: mobile ? 96 : 36
        }}>
          {this.renderEmptyContent()}
          {rows.map((row, index) => {
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  marginBottom: 36
                }}
              >
                {row.map(file => {
                  return (
                    <FileItem
                      key={file.sha256 || file.uploadid}
                      handlePromptDelete={this.props.PromptDeleteFile}
                      handleViewDetails={this.props.ViewDetails}
                      dimension={itemWidth}
                      margin={mobile ? 0 : 12}
                      mobile={this.props.mobile}
                      {...file}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
        {this.renderConfirmDeleteModal()}
        {this.renderViewDetailsModal()}
        {this.renderAddCreditModal()}
        {this.renderPaymentConfirmedModal()}
      </div>
    );
  };
}

const mapState = ({ files, app, media }) => {

  const _clientWidth = Math.min(app.clientWidth, CONTENT_MAX_WIDTH);

  const clientWidth = app.mobile ? _clientWidth : (_clientWidth - (MENU_WIDTH + 12));

  let itemsPerRow = Math.floor(clientWidth / GALLERY_MIN_COL_WIDTH);

  if (itemsPerRow < 1) {
    itemsPerRow = 1;
  }

  return {
    itemsPerRow,
    itemWidth: app.mobile ? clientWidth - 24 : ((clientWidth - (24 * (itemsPerRow + 1))) / itemsPerRow),
    mobile: app.mobile,
    transactionConfirmed: media.transactionConfirmed,
    promptDeleteFile: media.promptDeleteFile,
    viewDetails: media.viewDetails,
    initialized: media.initialized,
    clientHeight: app.clientHeight,
    query: media.query,
    sort: media.sort,
    addCreditModalOpen: media.addCreditModalOpen,
    storageTotal: media.storageTotal,
    clientWidth,
    files
  };
};

export default connect(mapState, { GetMedia, PromptDeleteFile, DeleteFile, ViewDetails })(Media);
