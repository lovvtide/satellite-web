import React, { PureComponent } from 'react';
import autosize from 'autosize';

import ProfileQuery from './ProfileQuery';
import { Button, ConfirmInline } from '../CommonUI';
import { COLORS } from '../../constants';
import { transition } from '../../helpers';


class Editor extends PureComponent {

	state = {
		value: '',
		hover: false,
		focus: false,
		sending: false,
		pendingUploads: false,
		hoverElement: '',
		attached: {}
	};

	constructor (props) {

		super(props);
		this.textarea = React.createRef();
		this.upload = React.createRef();
	}

	componentDidMount = () => {		

		this.handleAutosize();

		if (this.props.id) {

			const composeNewEditor = document.getElementById(this.props.id);

			if (composeNewEditor) {
				composeNewEditor.select();
			}
		}

	};

	componentWillUnmount = () => {

		clearTimeout(this._searchProfiles);
	};

	componentDidUpdate = (prevProps, prevState) => {

		if (this.state.cleared) {
			autosize.update(this.textarea.current);
		}
	};

	handleAutosize = () => {

		if (this.textarea.current) {
			autosize(this.textarea.current);
		}
	}

	handleFocus = (e) => {

		this.setState({ focus: true });

		if (this.props.onFocus) {

			this.props.onFocus();
		}
	};

	handleBlur = () => {

		if (!this.props.mobile) { return; }

		const update = {
			focus: false
		};

		if (this.props.mobile) {
			update.value = this.state.value.trim();
		}

		this.setState(update);
	};

	handleChange = (e) => {

		const { value } = e.target;

		this.setState({ value, cleared: false });

		if (this.props.handleQueryProfiles) {

			clearTimeout(this._searchProfiles);

			this._searchProfiles = setTimeout(() => { // debounce

				let i = value.lastIndexOf('@');

				const s = value.slice(i + 1);

				if (i > -1 && s.indexOf(' ') === -1 && (i === 0 || value[i - 1] === ' ' || value[i - 1] === '\n')) {

					this.props.handleQueryProfiles(s ? {
						context: this.props.id,
						term: s
					} : null)

				} else if (this.props.searchActive) {

					this.props.handleQueryProfiles(null);
				}

			}, 200);
		}
	}

	handleCancel = (confirm) => {

		if (confirm || this.props.mobile) {

			this.setState({ value: '', cleared: true, confirmCancel: false });

			if (this.props.onCancel) {
				this.props.onCancel();
			}

		} else {

			this.setState({ confirmCancel: true });
		}
 	};

 	handleSearchSelect = (item) => {

		this.props.handleQueryProfiles(null);

		this.setState({
			value: this.state.value.substring(0, this.state.value.lastIndexOf('@')) + `nostr:${item.npub}`
		}, () => {
			autosize.update(this.textarea.current);
		});

	};

	handlePost = async () => {

		this.setState({ sending: true });

		let success;

		try {

			await this.props.handlePost({
				content: this.state.value.trim()
			}, undefined, this.state.attached);

			success = true;

		} catch (err) {

			console.log(err);
		}

		if (success) {

			this.setState({ value: '', cleared: true, sending: false });

			if (this.props.onPosted) {

				this.props.onPosted();
			}

		} else {

			// TODO show error status

			this.setState({ sending: false });
		}
	};

	/*
	handleFilesSelected = (e) => {

		if (e.target.files.length === 0) { return; }

		const files = [ e.target.files[0] ];

		let pendingUploads = false;

		const attached = {
			...(this.state.attached || {})
		};

		for (let file of files) {

			if (attached[file.name]) { continue; }

			attached[file.name] = {
				infohash: null,
				event: null,
				loaded: 0,
				size: file.size,
				type: file.type,
				complete: false
			};

			pendingUploads = true;
		}

		this.setState({ attached, pendingUploads });

		uploadTorrentFiles(files, {

			onSignedEvent: (file, event) => {

				// TODO add the signed event to
				// the attached element


				let infohash = null;

				for (let tag of event.tags) {
					if (tag[0] === 'i') {
						infohash = tag[1];
						break;
					}
				}

				const update = {
					objectUrl: URL.createObjectURL(file),
					infohash,
					event
				};

				this.setState({
					attached: {
						...this.state.attached,
						[file.name]: {
							...(this.state.attached[file.name]),
							...update
						}
					}
				});

			},

			onProgress: (file, status) => {

				//console.log('params on progress', status);
				// TODO detect when complete (progress matches
				// total size)
				this.setState({
					attached: {
						...this.state.attached,
						[file.name]: {
							...(this.state.attached[file.name]),
							loaded: status.loaded
						}
					}
				});

			},

			onComplete: (file) => {

				const update = {
					pendingUploads: false,
					attached: {
						...this.state.attached,
						[file.name]: {
							...(this.state.attached[file.name]),
							complete: true
						}
					}
				};

				for (let filename of Object.keys(update.attached)) {

					if (!update.attached[filename].complete) {

						update.pendingUploads = true;
					}
				}

				this.setState(update);
			}

		});
	};
	*/

	/*
	renderUploadButton = () => {

		// TODO DEV disabled for now
		// until media stuff is ready
		return null;

		return (
			<label
				onMouseOver={() => this.setState({ hoverElement: 'addmedia' })}
				onMouseOut={() => this.setState({ hoverElement: '' })}
				style={{
					cursor: 'pointer',
					whiteSpace: 'nowrap',
					textTransform: 'uppercase',
					fontSize: 12,
					padding: '6px 9px',
					userSelect: 'none',
					fontFamily: 'JetBrains-Mono-Regular',
					opacity: this.state.hoverElement === 'addmedia' ? 1 : 0.85
				}}
			>
				<input
					id={`editor_${this.props.id}`}
					ref={this.upload}
					onChange={this.handleFilesSelected}
					type='file'
					//multiple
					style={{
						display: 'none'
					}}
				/>
				<Icon name='arrow alternate circle up outline' />
				<span>
					add media
				</span>
			</label>
		);
	};
	*/

	/*
	renderAttachedMediaPreview = () => {

		const { attached } = this.state;

		const filenames = Object.keys(attached);

		if (filenames.length === 0) { return null; }

		return (
			<div>
				{filenames.map(filename => {
					return (
						<UploadedMedia
							key={filename}
							name={filename}
							{ ...this.state.attached[filename] }
						/>
					);
				})}
			</div>
		);
	};
	*/

	render = () => {

		const trimmed = this.state.value.trim();

		return (
			<div style={{ ...styles.container, ...(this.props.style) }}>
				{/*{this.renderAttachedMediaPreview()}*/}
				<textarea
					id={this.props.id || undefined}
					ref={this.textarea}
					placeholder={this.props.placeholder}
					style={styles.textarea(this.props, this.state)}
					value={this.state.value}
					onChange={this.handleChange}
					onFocus={this.handleFocus}
					onBlur={this.handleBlur}
					onMouseOver={() => this.setState({ hover: true })}
					onMouseOut={() => this.setState({ hover: false })}
					rows={this.props.rows || 3}
					disabled={this.state.sending}
				/>
				{this.props.searchActive === this.props.id ? (
					<div style={{
						minHeight: 34,
						background: COLORS.primary
					}}>
						<ProfileQuery
							handleSelect={this.handleSearchSelect}
							maxResults={this.props.mobile ? 9 : 12}
							style={{
								paddingLeft: 4,
								paddingRight: 4,
								paddingBottom: 4,
								zIndex: 999999999,
								background: COLORS.primary,
								borderLeft: `1px dotted ${COLORS.secondary}`,
								borderRight: `1px dotted ${COLORS.secondary}`,
								borderBottom: `1px dotted ${COLORS.secondary}`,
								width: '-webkit-fill-available',
								...(this.props.searchStyle || {})
							}}
						/>
					</div>
				) : (<div style={styles.actionsContainer(this.props)}>
					<div style={{
						display: 'flex'
					}}>
						{/*{this.renderUploadButton()}*/}
					</div>
					<div style={{ display: 'flex' }}>
						{this.props.showCancel && !this.state.sending ? (this.state.confirmCancel ? (
							<ConfirmInline
								style={{ marginTop: 6, fontSize: 12, fontFamily: 'JetBrains-Mono-Regular' }}
								onConfirm={() => this.handleCancel(true)}
								onCancel={() => this.setState({ confirmCancel: false })}
								promptText='Discard Draft?'
								promptColor={COLORS.secondaryBright}
								confirmText='DISCARD'
								cancelText='CANCEL'
								confirmColor={COLORS.red}
							/>
						) : (
							<Button
								text='CANCEL'
								style={{ fontSize: this.props.mobile ? 14 : 12, border: 'none', color: '#fff', display: 'flex', alignItems: 'center' }}
								onClick={() => this.handleCancel(!trimmed)}
							/>
						)) : null}
						{!this.state.sending && !this.state.confirmCancel ? (<Button
							text='SEND'
							disabledOpacity={1}
							disableStatusMessage
							status={trimmed && !this.state.pendingUploads ? '' : 'disabled'}
							color={trimmed && !this.state.pendingUploads ? COLORS.satelliteGold : (trimmed ? '#fff' : 'rgba(255,255,255,0.85)')}
							style={{ fontSize: this.props.mobile ? 14 : 12, border: 'none', marginRight: this.props.mobile ? 0 : -9, fontFamily: trimmed ? 'JetBrains-Mono-Bold' : 'JetBrains-Mono-Regular', ...transition(0.2, 'ease', [ 'color']) }}
							chevronStyle={{ color: trimmed ? COLORS.satelliteGold : (trimmed ? '#fff' : 'rgba(255,255,255,0.85)'), ...transition(0.2, 'ease', [ 'border' ]) }}
							onClick={this.handlePost}
							chevronRight
						/>) : null}
					</div>
				</div>)}
			</div>
		);
	}
}

const styles = {

	actionsContainer: ({ mobile, modal }) => {
		return {
			fontWeight: modal ? 'bold' : 'normal',
			display: 'flex',
			justifyContent: 'space-between',
			marginTop: 2,
			height: 32,
			...(mobile ? {
				position: 'fixed',
				left: 0,
				top: 0,
				width: '100%',
				height: 54,
				background: COLORS.primary,
				marginTop: 0,
				padding: '0px 18px',
				borderBottom: `1px solid ${COLORS.secondary}`
			} : {})
		};
	},

	container: {
		color: '#fff'
	},

	textarea: ({ mobile, clientWidth, replyTo, modal }, { hover, focus }) => {
		return {
			textAlign: 'left',
			width: mobile ? clientWidth : '100%',
			color: 'rgba(255,255,255,0.85)',
			background: modal ? 'rgb(20, 21, 22)' : (mobile ? 'transparent' : (focus || hover ? `rgb(29, 30, 31)` : `rgb(27, 28, 29)`)),
			borderRadius: 4,
			padding: modal ? '16px 20px' : (mobile ? `0px 24px 0px ${replyTo ? 51 : 24}px` : '12px 13px'),
			border: modal ? '1px solid #fff' : (mobile ? 'none' : '1px dotted rgb(47, 54, 61)'),
			outline: 'none',
			resize: 'none',
			overflow: 'hidden',
			fontFamily: 'Lexend-Deca-Regular',
			lineHeight: '22px',
			'WebkitFontSmoothing': 'antialiased',
			marginLeft: mobile ? (replyTo ? -12 : -24) : 0,
			fontSize: mobile ? 15 : null
		};
	}
};

export default Editor;
