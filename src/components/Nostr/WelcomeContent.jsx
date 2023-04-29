import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import logo from '../../assets/branding.png';
import star from '../../assets/star_solid.svg';
import { COLORS } from '../../constants';
import { navigate } from '../../actions';


class WelcomeContent extends PureComponent {


	render = () => {
		return (
			<div
				style={{
					color: '#fff',
					height: this.props.clientHeight,
					marginTop: -48,
					display: 'flex',
					paddingTop: 124,
					justifyContent: 'center'
				}}
			>
				<div style={{
					width: 378
				}}>
					<div style={{
						top: '50%',
						position: 'absolute',
						transform: 'translate(0px, -50%)',
						width: 378
					}}>
						<img
							src={logo}
							style={{
								width: 365,
								opacity: 0.15,
								marginBottom: 36
							}}
						/>
						<div style={{
							fontSize: 14,
						}}>
							<div style={styles.bullet}>
								<img src={star} style={styles.star} />
								<div style={styles.bulletText}>
									Select conversation threads from the list at left to read replies without losing your place
								</div>
							</div>
							<div style={styles.bullet}>
								<img src={star} style={styles.star} />
								<div style={styles.bulletText}>
									Click the chevron in the header to toggle between
									thread-browsing mode and thread-reader mode
								</div>
							</div>
							<div style={styles.bullet}>
								<img src={star} style={styles.star} />
								<div style={styles.bulletText}>
									View any nostr profile at <span style={styles.pre}>{`/@<npub>`}</span> or <span style={styles.pre}>{`/@<nip05>`}</span> e.g. <a onClick={e => { e.preventDefault(); this.props.navigate(`/@jack@cash.app`) }} style={styles.link} href={'https://satellite.earth/@jack@cash.app'}>https://satellite.earth/@jack@cash.app</a>
								</div>
							</div>
							<div style={styles.bullet}>
								<img src={star} style={styles.star} />
								<div style={styles.bulletText}>
									If you have a nostr extension such as <a style={styles.link} href={`https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp`} target='_blank'>nos2x</a> or <a style={styles.link} href={`https://getalby.com`} target='_blank'>Alby</a>, simply click
									"connect nostr" to sign in and start posting
								</div>
							</div>
							<div style={styles.bullet}>
								<img src={star} style={styles.star} />
								<div style={styles.bulletText}>
									If you don't have a nostr identity, you can create a new one
									on the <a style={styles.link} onClick={() => this.props.navigate('/register')}>sign up page</a>
								</div>
							</div>
							<div style={styles.bullet}>
								<img src={star} style={styles.star} />
								<div style={styles.bulletText}>
									If you'd like to sign in by copy/pasting a private key (not recommended, but hey) you can do so <a style={styles.link} onClick={() => this.props.navigate('/auth')}>here</a>
								</div>
							</div>
						</div>
						<div style={{ opacity: 0.25, marginLeft: 24, color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 38 }}>
							Satellite is being developed by <a style={styles.link} onClick={e => { e.preventDefault(); this.props.navigate(`/@npub1lunaq893u4hmtpvqxpk8hfmtkqmm7ggutdtnc4hyuux2skr4ttcqr827lj`) }} href={`https://satellite.earth/@npub1lunaq893u4hmtpvqxpk8hfmtkqmm7ggutdtnc4hyuux2skr4ttcqr827lj`}>Stuart Bowman</a>
						</div>
					</div>
				</div>
			</div>
		);
	};

}

const mapState = ({ app }) => {

	return {
		clientHeight: app.clientHeight
	};
};

const styles = {

	link: {
		color: '#fff',
		textDecoration: 'underline',
		cursor: 'pointer'
	},

	pre: {
		fontFamily: 'JetBrains-Mono-Regular',
		background: COLORS.secondary,
		fontSize: 12,
		color: '#fff',
		padding: '2px 3px'
	},

	bulletText: {
		color: 'rgba(255,255,255,0.85)',
		fontSize: 13
	},

	star: {
		height: 14,
		width: 14,
		marginRight: 10,
		marginTop: 3,
	},

	bullet: {
		display: 'flex',
		alignItems: 'top',
		fontSize: 15,
		marginBottom: 12
	}

};

export default connect(mapState, { navigate })(WelcomeContent);
