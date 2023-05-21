import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Icon } from 'semantic-ui-react';

import { GetMedia, PromptDeleteFile, DeleteFile, ViewDetails } from '../../../actions';
import { transition } from '../../../helpers';
import { GALLERY_MIN_COL_WIDTH, COLORS, MENU_WIDTH } from '../../../constants';

import Modal from './Modal';
import Button from './Button';
import Header from './Header';
import FileItem from './FileItem';
import AddCredit from './AddCredit';


class Media extends PureComponent {

  //state = { scrollTop: 0 };

  componentDidMount = () => {

    if (!this.props.initialized) {

      this.props.GetMedia();
    }

    if (!this.props.mobile) {

      this.container = document.getElementById('sidepanel_scroll_container');

      // if (this.container) {

      //   this.container.addEventListener('scroll', this.handleScroll);
      // } 
    }
  };

  // componentWillUnmount = () => {

  //   if (this.container) {

  //     this.container.removeEventListener('scroll', this.handleScroll);
  //   }
  // };

  // handleScroll = (e) => {

  //   //const { scrollTop } = e.target;

  //   //console.log('scrollTop', e.srcElement.scrollTop);

  //   this.setState({ scrollTop: e.srcElement.scrollTop });
  // };

  renderConfirmDeleteModal = () => {

    const { promptDeleteFile, clientWidth } = this.props;

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

    if (!this.props.addCreditModalOpen) { return null; }

    return <AddCredit />;
  };

  render = () => {

    const { itemsPerRow, itemWidth, mobile } = this.props;
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
        <Header />
        <div style={{
          paddingTop: mobile ? 96 : 36
        }}>
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
                      //scrollTop={this.state.scrollTop}
                      handlePromptDelete={this.props.PromptDeleteFile}
                      handleViewDetails={this.props.ViewDetails}
                      dimension={itemWidth}
                      margin={12}
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
      </div>
    );
  };
}

const mapState = ({ files, app, media }) => {

  const clientWidth = app.mobile ? app.clientWidth : (app.clientWidth - (MENU_WIDTH + 12));

  let itemsPerRow = Math.floor(clientWidth / GALLERY_MIN_COL_WIDTH);

  if (itemsPerRow < 1) {
    itemsPerRow = 1;
  }

  return {
    itemsPerRow,
    itemWidth: ((clientWidth - (24 * (itemsPerRow + 1))) / itemsPerRow),
    mobile: app.mobile,
    promptDeleteFile: media.promptDeleteFile,
    viewDetails: media.viewDetails,
    initialized: media.initialized,
    clientHeight: app.clientHeight,
    query: media.query,
    sort: media.sort,
    addCreditModalOpen: media.addCreditModalOpen,
    clientWidth,
    files
  };
};

export default connect(mapState, { GetMedia, PromptDeleteFile, DeleteFile, ViewDetails })(Media);
