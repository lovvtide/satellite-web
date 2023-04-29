
// Upcoming new moons until June 2024
export const NEW_MOONS = [
	1656471120, // Tue Jun 28 2022 19:52:00 GMT-0700 (Pacific Daylight Time)
	1659030900, // Thu Jul 28 2022 10:55:00 GMT-0700 (Pacific Daylight Time)
	1661588220, // Sat Aug 27 2022 01:17:00 GMT-0700 (Pacific Daylight Time)
	1664142840, // Sun Sep 25 2022 14:54:00 GMT-0700 (Pacific Daylight Time)
	1666694940, // Tue Oct 25 2022 03:49:00 GMT-0700 (Pacific Daylight Time)
	1669244220, // Wed Nov 23 2022 14:57:00 GMT-0800 (Pacific Standard Time)
	1671790620, // Fri Dec 23 2022 02:17:00 GMT-0800 (Pacific Standard Time)
	1674334380, // Sat Jan 21 2023 12:53:00 GMT-0800 (Pacific Standard Time)
	1676876760, // Sun Feb 19 2023 23:06:00 GMT-0800 (Pacific Standard Time)
	1679419380, // Tue Mar 21 2023 10:23:00 GMT-0700 (Pacific Daylight Time)
	1681963920, // Wed Apr 19 2023 21:12:00 GMT-0700 (Pacific Daylight Time)
	1684511580, // Fri May 19 2023 08:53:00 GMT-0700 (Pacific Daylight Time)
	1687063020, // Sat Jun 17 2023 21:37:00 GMT-0700 (Pacific Daylight Time)
	1689618720, // Mon Jul 17 2023 11:32:00 GMT-0700 (Pacific Daylight Time)
	1692178680, // Wed Aug 16 2023 02:38:00 GMT-0700 (Pacific Daylight Time)
	1694742000, // Thu Sep 14 2023 18:40:00 GMT-0700 (Pacific Daylight Time)
	1697306100, // Sat Oct 14 2023 10:55:00 GMT-0700 (Pacific Daylight Time)
	1699867620, // Mon Nov 13 2023 01:27:00 GMT-0800 (Pacific Standard Time)
	1702423920, // Tue Dec 12 2023 15:32:00 GMT-0800 (Pacific Standard Time)
	1704974220, // Thu Jan 11 2024 03:57:00 GMT-0800 (Pacific Standard Time)
	1707519540, // Fri Feb 09 2024 14:59:00 GMT-0800 (Pacific Standard Time)
	1710061200, // Sun Mar 10 2024 01:00:00 GMT-0800 (Pacific Standard Time)
	1712600460, // Mon Apr 08 2024 11:21:00 GMT-0700 (Pacific Daylight Time)
	1715138520, // Tue May 07 2024 20:22:00 GMT-0700 (Pacific Daylight Time)
	1717677480  // Thu Jun 06 2024 05:38:00 GMT-0700 (Pacific Daylight Time)
];

export const getLastNewMoon = (options = {}) => {

	const now = typeof options.now === 'undefined' ? Math.floor(Date.now() / 1000) : options.now;

	for (let z = 0; z < NEW_MOONS.length; z++) {

		const moment = NEW_MOONS[z];

		if (moment >= now) {

			return NEW_MOONS[z - 1];
		}
	}
};

export const getNextNewMoon = (options = {}) => {

	const now = typeof options.now === 'undefined' ? Math.floor(Date.now() / 1000) : options.now;

	for (let z = 0; z < NEW_MOONS.length; z++) {

		const moment = NEW_MOONS[z];

		if (moment > now) {

			return moment;
		}
	}
};
