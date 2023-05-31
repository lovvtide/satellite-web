import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';

import { relativeTime, formatDataSize, transition } from '../../../helpers';
import { COLORS } from '../../../constants';

import Dropdown from './Dropdown';
import Loader from './Loader';


class FileItem extends PureComponent {

	state = {};

	constructor (props) {
		super(props);
		this.link = React.createRef();
	}

	handleDropdownSelect = (selected) => {

		console.log('selected', selected);

		switch (selected.toLowerCase()) {

			case 'view details':
				this.props.handleViewDetails(this.props);
				break;

			case 'delete file':
				this.props.handlePromptDelete(this.props);
				break;

			default:
				break;
		}

		// if (selected.toLowerCase() === 'download') {
		// 	this.handleDownloadFile();
		// }
	};

	// handleDownloadFile = () => {

	// 	const a = document.createElement('a');

	// 	a.href = this.props.url;
	// 	a.download = this.props.name;
	// 	a.click();
	// 	a.remove();
	// };

	handleCopyLink = () => {

		if (this.state.copying) { return; }

		let copied;

		this.link.current.select();

		try {

			document.execCommand('copy');

			copied = true;

		} catch (err) {

			this.link.current.blur();
			window.getSelection().empty();
		}

		if (copied) {

			if (this.props.copyAnimation !== false) {

				this.setState({ copying: true });
			}

			setTimeout(() => {

				this.setState({ copyStarted: true });
				//window.getSelection().empty();

			}, 50);

			setTimeout(() => {

				this.setState({ copying: false, copyStarted: false });
				window.getSelection().empty();
				this.link.current.blur();

			}, 650);
		}
	};

	renderHeader = () => {

		const { uploadid } = this.props;
		const { copying, copyStarted, hoverCopy, hoverLink } = this.state;

		return (
			<div
				style={{
					opacity: uploadid ? 0 : 1,
					pointerEvents: uploadid ? 'none' : 'auto',
					marginBottom: 8,
					display: 'flex',
					alignItems: 'center',
					position: 'relative'
				}}
			>
				{copying ? (
					<div
						style={{
							color: COLORS.blue,
							padding: '4px 8px',
							position: 'absolute',
							transform: `translate(0px, ${(copyStarted ? -24 : -12)}px)`,
							fontSize: 12,
							textAlign: 'center',
							minWidth: 70,
							zIndex: 3,
							fontFamily: 'monospace',
							...transition(0.6, 'ease-out', [ 'transform' ])
						}}
					>
						COPIED!
					</div>
				) : null}
				<div
					onMouseOver={() => this.setState({ hoverCopy: true })}
					onMouseOut={() => this.setState({ hoverCopy: false })}
					onClick={this.handleCopyLink}
					style={{
						opacity: hoverCopy || copying ? 1 : 0.85,
						marginRight: 6,
						fontSize: 11,
						border: `1px solid ${COLORS.secondary}`,
						fontFamily: 'monospace',
						height: 24,
						display: 'flex',
						alignItems: 'center',
						minWidth: 76,
						justifyContent: 'center',
						color: '#fff',
						cursor: 'pointer',
						userSelect: 'none',
						borderRadius: 5
					}}
				>
					COPY LINK
				</div>
				<a style={{ width: '100%' }} href={this.props.url} target='_blank'>
					<input
						readOnly
						onMouseOver={() => this.setState({ hoverLink: true })}
						onMouseOut={() => this.setState({ hoverLink: false })}
						ref={this.link}
						value={this.props.url}
						style={{
							fontFamily: 'Lexend-Deca-Regular',
							cursor: 'pointer',
							outline: 'none',
							border: 'none',
							width: this.props.mobile ? '100%' : '98%',
							paddingRight: 4,
							background: COLORS.primary,
							color: `rgba(255,255,255,${hoverLink || copying ? 1 : 0.85})`,
							textDecoration: hoverLink ? 'underline' : 'none'
						}}
					/>
				</a>
			</div>
		);
	};

	renderMedia = () => {

		const { dimension, uploadid, progress, error } = this.props;
		const { loadError } = this.state;

		const type = this.props.type.split('/')[0];

		let element;



		if (uploadid) {

			let status;

			if (error) {

				status = (
					<span style={{ minWidth: 150, textAlign: 'center', color: COLORS.red }}>
						<Icon name='warning sign' />
						Upload Error
					</span>
				);

			} else if (progress === 100) {

				status = (
					<span style={{ minWidth: 150, textAlign: 'center' }}>
						Finalizing Upload
						<Loader />
					</span>
				);

			} else {

				status = (
					<span style={{ minWidth: 150, textAlign: 'center' }}>
						Uploading {progress}%
					</span>
				);
			}

			element = (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: dimension * (9 / 16),
					width: dimension,
					fontSize: 13
				}}>
					{status}
				</div>
			);

		} else if (loadError) {

			element = (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: dimension * (9 / 16),
					width: dimension,
					color: COLORS.secondaryBright
				}}>
					404 File Not Found
				</div>
			);

		} else if (type === 'image') {

			element = (
				<img
					src={this.props.url}
					style={{ outline: 'none', maxWidth: dimension - 2, maxHeight: dimension * (9 / 16) }}
					onError={() => this.setState({ loadError: true })}
				/>
			);

		} else if (type === 'video') {

			element = (
				<video
					controls
					preload='metadata'
					src={this.props.url + (this.props.mobile ? '#t=0.001' : '')}
					style={{ outline: 'none', maxWidth: dimension - 2, maxHeight: dimension * (9 / 16) }}
				/>
			);

		} else if (type === 'audio') {

			element = (
				<audio
					controls
					src={this.props.url}
					style={{
						//filter: 'invert(0.95)',
						outline: 'none',
						maxWidth: dimension - 48,
						maxHeight: dimension * (9 / 16)
					}}
				/>
			);

		} else {

			element = (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: dimension * (9 / 16),
					width: dimension,
					color: COLORS.secondaryBright
				}}>
					<Icon name='file outline' style={{ height: 18, fontSize: 15 }} />
					<span>{this.props.type}</span>
				</div>
			);
		}

		// TODO render "could not be displayed" elememt
		return (
			<div
				style={{
					minHeight: dimension * (9 / 16),
					minWidth: dimension - 2,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					background: this.state.loadError ? 'none' : '#000',
					border: `1px solid rgba(47, 54, 61, 0.6)`
				}}
			>
				{element}
			</div>
		);
	};

	renderFooter = () => {
		return (
			<div
				style={{
					marginTop: 8,
					display: 'flex',
					justifyContent: 'space-between'
				}}
			>
				<div style={{
					display: 'flex',
					maxWidth: '90%',
					overflow: 'hidden',
					textOverflow: 'ellipsis'
				}}>
					<span style={{
						marginRight: 12,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						maxWidth: '50%'
					}}>
						{this.props.name}
					</span>
					<span style={{
						marginRight: 12,
						color: COLORS.secondaryBright,
						textOverflow: 'ellipsis'
					}}>
						{formatDataSize(this.props.size)}
					</span>
					{this.props.uploadid ? null : (
						<span style={{
							color: COLORS.secondaryBright,
							overflow: 'hidden',
							textOverflow: 'ellipsis'
						}}>
							{relativeTime(this.props.created)}
						</span>
					)}
				</div>
				<div style={{
					display: 'flex'
				}}>
					{true/*this.props.uploadid*/ ? null : (
						<Icon
							name='download'
							style={{
								fontSize: 11,
								marginRight: 10
							}}
						/>
					)}
					{true/*this.props.uploadid*/ ? null : (
						<Icon
							name='magnet'
							style={{
								fontSize: 11,
								marginRight: 6
							}}
						/>
					)}
					{this.props.uploadid ? null : (
						<Dropdown
							style={{
								zIndex: 1,
								marginRight: 8,
								marginTop: 1,
								position: 'relative'
								// justifyContent: 'end'
							}}
							dropdownStyle={{
								borderLeft: '1px solid rgba(47, 54, 61, 0.6)',
								borderRight: '1px solid rgba(47, 54, 61, 0.6)',
								borderBottom: '1px solid rgba(47, 54, 61, 0.6)',
								transform: `translate(-100px, ${12 - this.props.scrollTop}px)`,
								padding: '8px 12px',
								fontFamily: 'monospace',
								fontSize: 11,
								right: 0,
								top: 24
							}}
							dropdownWidth={126}
							chevronDimenson={11}
							onSelect={this.handleDropdownSelect}
							uniqueid={this.props.sha256 || this.props.uploadid}
							items={[
								//'VIEW DETAILS',
								'DELETE FILE'
							]}
							icons={[
								//'info circle',
								'trash alternate'
							]}
						/>
					)}
				</div>
			</div>
		);
	};

	render = () => {

		const { hover, expanded } = this.state;

		return (
			<div
				style={{
					width: this.props.dimension,
					marginLeft: this.props.margin,
					marginRight: this.props.margin,
					//overflow: 'hidden',
					fontSize: 13
				}}
			>
				<div
					onMouseOver={() => this.setState({ hover: true })}
					onMouseOut={() => this.setState({ hover: false })}
					style={{
						whiteSpace: 'nowrap'
					}}
				>
					{this.renderHeader()}
					{this.renderMedia()}
					{this.renderFooter()}
				</div>
			</div>
		);
	};
}

export default FileItem;
