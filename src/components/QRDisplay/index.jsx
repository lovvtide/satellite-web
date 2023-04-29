import React, { PureComponent } from 'react';
import { Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';
import QRCode from 'react-qr-code';

import { displayQR } from '../../actions';
import { COLORS } from '../../constants';


class QRDisplay extends PureComponent {

	render = () => {
		return (
			<Modal 
				open
				size='small'
				onClose={() => this.props.displayQR(null)}
			>
				<QRCode
					value={this.props.value}
					fgColor={COLORS.primary}
				/>
			</Modal>
		);
	};
}

const mapState = ({ app }) => {

	return { value: app.displayQR };
};

export default connect(mapState, { displayQR })(QRDisplay);
