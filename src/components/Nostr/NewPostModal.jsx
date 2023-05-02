import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { X } from '../CommonUI';
import Modal from './Modal';
import NewPostEditor from './NewPostEditor';

import { setNewPostModalOpen, handleNostrPublish, queryProfiles } from '../../actions';
import svgtransmit from '../../assets/transmit.svg';
import { COLORS } from '../../constants';


class NewPostModal extends PureComponent {

	componentDidMount = () => {

		this.editor = document.getElementById('compose_new_editor_modal');

		if (this.editor) {

			this.editor.focus();
		}
	};

	componentDidUpdate = (prevProps) => {

		if (this.props.open) {

			if (!prevProps.open) {

				document.body.style['overflow-y'] = 'hidden';
			}

		} else {

			if (prevProps.open) {

				document.body.style['overflow-y'] = 'auto';
			}
		}

	};

	handlePost = (post) => {

		handleNostrPublish(post);
	};

	handleClose = () => {

		this.props.setNewPostModalOpen(false);
	}

	render = () => {

		const { pubkey, open } = this.props;

		if (!open) { return null; }

		return (
			<Modal
				fixed
				handleClose={this.handleClose}
				clientHeight={this.props.clientHeight}
				clientWidth={this.props.clientWidth}
				style={{
					padding: '36px 36px 24px',
					width: 587,
					background: COLORS.primary,
					border: `1px solid ${COLORS.secondary}`,
					transform: 'translate(-50%, -50%)',
					top: '50%'
				}}
			>
				{/*<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: 24,
					marginLeft: -24,
					marginRight: -24
				}}>
					<div style={{
						display: 'flex',
						alignItems: 'center'
					}}>
						<img
							style={{ marginRight: 8, marginTop: -2, opacity: 0.25 }}
							src={svgtransmit}
							height={20}
							width={20}
						/>
						<span style={{
							fontSize: 14,
							opacity: 0.25,
							fontFamily:'JetBrains-Mono-Regular',
							color: '#fff'
						}}>
							NEW POST
						</span>
					</div>
					<X
						style={{ color: COLORS.secondaryBright }}
						dimension={20}
						onClick={this.handleClose}
					/>
				</div>*/}
				<NewPostEditor
					modal
					editorId='compose_new_editor_modal'
					searchActive={this.props.searchActive}
					handleQueryProfiles={this.props.queryProfiles}
					handlePost={this.handlePost}
					onCancel={this.handleClose}
					onResolve={this.handleClose}
					author={{
						pubkey,
						...(this.props.metadata[pubkey] || {})
					}}
				/>
			</Modal>
		);
	};
}

const mapState = ({ app, nostr, query }) => {

	return {
		open: app.newPostModalOpen,
		pubkey: nostr.pubkey,
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		metadata: nostr.metadata || {},
		searchActive: query.active
	};
};

export default connect(mapState, { setNewPostModalOpen, queryProfiles })(NewPostModal);
