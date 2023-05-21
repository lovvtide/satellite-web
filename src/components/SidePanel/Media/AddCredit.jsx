import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { SetAddCreditModalOpen } from '../../../actions';
import { COLORS, MENU_WIDTH } from '../../../constants';

import Modal from './Modal';
import Button from './Button';


class AddCredit extends PureComponent {

	handleRequestInvoice = () => {




	};

	render = () => {

		const { clientWidth, clientHeight } = this.props;

		return (
			<Modal
        handleClose={() => this.props.SetAddCreditModalOpen(false)}
        clientHeight={clientHeight}
        clientWidth={clientWidth + 24}
        closeOnDimmerClick
        style={{
          border: `1px solid ${COLORS.secondary}`,
          background: COLORS.primary,
          minWidth: Math.min(360, clientWidth),
          maxWidth: clientWidth - 24,
          padding: 24
        }}
      >
      	<div style={{ marginBottom: 24 }}>ADD CREDIT</div>
      	<Button
      		label='Request Invoice'
      		onClick={this.handleRequestInvoice}
      	/>
      </Modal>
		);
	};
}

const mapState = ({ media, app }) => {

	return {
		//open: media.addCreditModalOpen,
		clientWidth: app.mobile ? app.clientWidth : (app.clientWidth - (MENU_WIDTH + 36)),
		clientHeight: app.clientHeight
	};
};

export default connect(mapState, { SetAddCreditModalOpen })(AddCredit);
