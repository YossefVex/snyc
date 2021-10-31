import got from 'got';
import Semver from 'semver';

const getPackageAPI = async (name, version) => {
	try {
		const npmPackage = await got(`https://registry.npmjs.org/${name}`).json();

		return npmPackage?.versions[version].dependencies;
	} catch (error) {
		throw new Error(error);
	}
};

const getPackagesRecursivly = async (name, version, dependencies) => {
	if (!dependencies || !Object.keys(dependencies).length) {
		return [];
	}
	const totalDependencies = [];
	for (const dependencyName in dependencies) {
		try {
			const dependencyVersion = Semver.minVersion(dependencies[dependencyName]).raw;
			const dependencyAPI = await getPackageAPI(dependencyName, dependencyVersion);
			const dependencyRecDFS = await getPackagesRecursivly(dependencyName, dependencyVersion, dependencyAPI);
			totalDependencies.push({ name: dependencyName, version: dependencyVersion, dependencies: dependencyRecDFS });
		} catch (e) {
			console.log(e);
		}
	}
	return totalDependencies;
};
/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage = async function (req, res, next) {
	const { name, version } = req.params;
	const dependencies = await getPackageAPI(name, version);
	const totalDependencies = await getPackagesRecursivly(name, version, dependencies);
	return res.status(200).json({ name, version, dependencies: totalDependencies });
};
