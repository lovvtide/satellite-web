import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import { PutFile, SearchFiles, SetFilesSort, SetAddCreditModalOpen } from '../../../actions';
import { COLORS } from '../../../constants';

import { X, Dropdown } from '../../CommonUI'; 


class Header extends PureComponent {

  state = {};

  handlePutFiles = (e) => {

    if (e.target.files.length === 0) { return; }

    for (let file of e.target.files) {

      this.props.PutFile(file);
    }
  };

  handleSortDropdownSelect = (selected) => {

    const map = {
      'RECENT': 'time',
      'FILE SIZE': 'size',
      'FILE NAME': 'name'
    };

    this.props.SetFilesSort(map[selected]);
  };

  renderSortSelector = () => {

    if (this.props.mobile) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 12,
          alignItems: 'center',
          fontFamily: 'JetBrains-Mono-Regular'
        }}>
          <div
            style={{
              marginRight: 6,
              fontSize: 12
            }}
          >
            SORT:
          </div>
          <Dropdown
            toggleStyle={{
              // zIndex: 1,
              // marginRight: 8,
              // marginTop: 1,
              // position: 'relative',
              display: 'flex',
              alignItems: 'center',
              fontSize: 12,
              marginRight: 4
            }}
            chevronStyle={{ marginLeft: 9 }}
            dropdownStyle={{
              // borderLeft: '1px solid rgba(47, 54, 61, 0.6)',
              // borderRight: '1px solid rgba(47, 54, 61, 0.6)',
              // borderBottom: '1px solid rgba(47, 54, 61, 0.6)',
              // transform: `translate(-100px, ${12 - this.props.scrollTop}px)`,
              // padding: '8px 12px',
              // fontFamily: 'monospace',
              // fontSize: 11,
              // right: 0,
              // top: 24
            }}
            dropdownWidth={126}
            chevronDimenson={7}
            onSelect={this.handleSortDropdownSelect}
            uniqueid={'media_select_sort'}
            items={[
              'RECENT',
              'FILE SIZE',
              'FILE NAME'
            ]}
            // icons={[
            //   'clock outline',
            //   'chart pie',
            //   'sort alphabet ascending'
            // ]}
            selectedValue={({
              time: 'RECENT',
              size: 'FILE SIZE',
              name: 'FILE NAME'
            })[this.props.sort]}
          />
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          whiteSpace: 'nowrap',
          fontFamily: 'JetBrains-Mono-Regular',
          fontSize: 11
        }}
      >
        <div
          style={{
            marginRight: 12,
            fontSize: 12,
            color: COLORS.secondaryBright
          }}
        >
          SORT:
        </div>
        {([
          { sort: 'time', label: 'RECENT', icon: 'clock outline', iconStyle: { height: 20, fontSize: 13, marginRight: 5 } },
          { sort: 'size', label: 'FILE SIZE', icon: 'chart pie', iconStyle: { height: 20, fontSize: 12, width: 18, marginRight: 5 } },
          { sort: 'name', label: 'FILE NAME', icon: 'sort alphabet ascending', iconStyle: { height: 20, fontSize: 13, marginRight: 5 } }
        ]).map(({ sort, label, icon, iconStyle }) => {
          const hover = (sort === this.state.hover);
          const active = (sort === this.props.sort);
          return (
            <div
              key={sort}
              onClick={() => this.props.SetFilesSort(sort)}
              onMouseOver={() => this.setState({ hover: sort })}
              onMouseOut={() => this.setState({ hover: '' })}
              style={{
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                opacity: hover || active ? 1 : 0.85,
                marginRight: 10,
                cursor: 'pointer',
                paddingTop: 5,
                paddingBottom: 4,
                paddingRight: 2,
                borderBottom: `2px solid ${active ? '#fff' : 'transparent'}`
              }}
            > 
              <Icon name={icon} style={iconStyle} />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  renderSearch = () => {

    const { query } = this.props;

    return (
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', zIndex: 1 }}>
        <input
          onChange={(e) => this.props.SearchFiles(e.target.value)}
          value={query || ''}
          placeholder='SEARCH:'
          style={{
            color: '#fff',
            fontFamily: 'JetBrains-Mono-Regular',
            fontSize: 12,
            width: '100%',
            marginLeft: 12,
            background: 'rgba(30, 31, 31)',
            outline: 'none',
            border: '1px solid rgba(47, 54, 61, 0.5)',
            height: 32,
            borderRadius: 16,
            paddingLeft: 12,
            paddingRight: 38,
          }}
        />
        <X
          onClick={() => this.props.SearchFiles('')}
          dimension={17}
          style={{
            marginLeft: -28,
            marginRight: 10,
            opacity: query ? 1 : 0,
            pointerEvents: query ? 'auto' : 'none'
          }}
        />
      </div>
    );
  };

  renderUploadButton = () => {

    const { timeRemaining } = this.props;

    return (
      <label
        htmlFor='upload_file'
        onClick={timeRemaining !== null && timeRemaining <= 0 ? (() => this.props.SetAddCreditModalOpen(true)) : undefined}
        onMouseOver={() => this.setState({ hover: 'upload' })}
        onMouseOut={() => this.setState({ hover: '' })}
        style={{
          color: this.state.hover === 'upload' ? '#fff' : 'rgba(255,255,255,0.85)',
          minWidth: this.props.mobile ? 82 : 118,
          border: `0.5px solid ${COLORS.satelliteGold}`,
          borderRadius: 15,
          marginLeft: this.props.mobile ? 12 : 24,
          fontSize: 11,
          fontFamily: 'JetBrains-Mono-Regular',
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <Icon name='plus' style={{ height: 20, marginLeft: -3, marginRight: 5 }} />
        {this.props.mobile ? 'UPLOAD' : 'UPLOAD FILE'}
      </label>
    );

    // return this.props.timeRemaining ? button : (
    //   <Popup
    //     trigger={button}
    //     content='Click "Add Credit to buy storage with Lightning"'
    //     position='top center'
    //   />
    // );
  };

  render = () => {

    const { mobile, timeRemaining } = this.props;

    return (
      <div
        id='list_header'
        style={{
          position: mobile ? 'fixed' : 'sticky',
          left: 0,
          top: mobile ? 48 : 0,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          paddingRight: 12,
          background: COLORS.primary,
          width: mobile ? this.props.clientWidth : this.props.clientWidth - 24,
          justifyContent: 'space-between',
          boxShadow: `${COLORS.primary} 0px 16px 16px 0px`,
          zIndex: 2
        }}
      >
        {this.renderSortSelector()}
        {this.renderSearch()}
        <input
          id='upload_file'
          style={{ width: 188 }}
          onChange={this.handlePutFiles}
          disabled={timeRemaining !== null && timeRemaining <= 0}
          type='file'
          hidden
        />
        {this.renderUploadButton()}
      </div>
    );
  };
}

const mapState = ({ app, media }) => {

  return {
    //clientWidth: app.mobile ? app.clientWidth : (app.clientWidth - (MENU_WIDTH + 36)),
    mobile: app.mobile,
    query: media.query,
    sort: media.sort,
    timeRemaining: media.timeRemaining
  };
};


export default connect(mapState, { PutFile, SearchFiles, SetFilesSort, SetAddCreditModalOpen })(Header);
