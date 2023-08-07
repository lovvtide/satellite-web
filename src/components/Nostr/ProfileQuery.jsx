import React, { Component } from 'react';
import { connect } from 'react-redux';
//import { Link } from 'react-router-dom';

import { COLORS } from '../../constants';
import Image from './Image';


class ProfileQuery extends Component {

	state = { hover: '' };

	componentDidMount = () => {

		window.addEventListener('keydown', this.handleKeyDown);

		if (this.props.preventScroll) {
			document.body.style['overflow-y'] = 'hidden';
		}
	};

	componentWillUnmount = () => {

		window.removeEventListener('keydown', this.handleKeyDown);

		if (this.props.preventScroll) {

			document.body.style['overflow-y'] = 'auto';
		}
	};

	handleKeyDown = (e) => {

		if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) { return; }

		const items = this.props.results.filter((item, index) => {
			return index < (this.props.maxResults || 12);
		});

		if (items.length === 0) { return; }

		const inc = (v) => {

			let index = -1;

			if (this.state.hover) {

				for (let i = 0; i < items.length; i++) {
					if (items[i].npub === this.state.hover) {
						index = i;
						break;
					}
				}
			}

			index += v;

			if (index < 0) {

				this.setState({
					hover: items[items.length - 1].npub
				});

			} else if (index > items.length - 1) {

				this.setState({
					hover: items[0] ? items[0].npub : ''
				});

			} else {

				this.setState({
					hover: items[index] ? items[index].npub : ''
				});
			}

		};

		if (e.key === 'ArrowDown') {

			e.preventDefault();
			inc(1);

		} else if (e.key === 'ArrowUp') {

			e.preventDefault();
			inc(-1);

		} else if (e.key === 'Enter' && this.state.hover) {

			e.preventDefault();

			let select;

			for (let item of items) {

				if (item.npub === this.state.hover) {
					select = item;
				}
			}

			if (!select) { return; }

			this.props.handleSelect(select);
		}
	};

	render = () => {

		return (
			<div style={this.props.style || {}}>
				{this.props.results.length > 0 ? this.props.results.filter((item, index) => {
					return index < (this.props.maxResults || 12);
				}).map((item) => {
					const { name, picture, npub } = item;
					return (
						<div
							key={npub}
							onClick={() => this.props.handleSelect(item)}
							onMouseOver={() => this.setState({ hover: npub })}
							onMouseOut={() => this.setState({ hover: '' })}
							style={{
								borderRadius: 3,
								background: this.state.hover === npub ? 'rgba(31, 32, 33, 0.8)' : COLORS.primary,
								color: '#fff',
								display: 'flex',
								alignItems: 'center',
								overflow: 'hidden',
								cursor: 'pointer',
								padding: '4px 8px'
							}}
						>
							{picture ? (
								<Image
									src={picture}
									style={styles.image}
								/>
							) : (
								<div
									style={{
										...styles.image,
										border: `1px solid ${COLORS.secondary}`
									}}
								/>
							)}
							<div>
								<div style={{ fontSize: 13, fontWeight: 'bold' }}>{name}</div>
								<div style={{ fontSize: 13, color: COLORS.secondaryBright, fontFamily: 'JetBrains-Mono-Regular' }}>
									{npub.slice(0, 8) + '...' + npub.slice(-4)}
								</div>
							</div>
						</div>
					);
				}) : (
					<div style={{
						//paddingBottom: 6,
						fontStyle: 'italic',
						fontSize: 13,
						color: COLORS.secondaryBright,
						paddingLeft: 4
					}}>
						No Results
					</div>
				)}
			</div>
		);
	};
};

const mapState = ({ query }) => {

	return query;
};

const styles = {

	image: {
		minWidth: 36,
		width: 36,
		height: 36,
		borderRadius: 18,
		marginRight: 12
	}

};

export default connect(mapState)(ProfileQuery);
