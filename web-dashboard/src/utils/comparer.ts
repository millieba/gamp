function comparer(inputObj: any) {
    const compareTo = [{"nameWithOwner":"jabrobak/IT2805---G24-Project-2018"},{"nameWithOwner":"millieba/kvitteringsApp"},{"nameWithOwner":"janschop/bachelornettside"},{"nameWithOwner":"Vcsvends/Databaser-Prosjektarbeid"},{"nameWithOwner":"millieba/oop-notes"},{"nameWithOwner":"janschop/bachelor_nettside"},{"nameWithOwner":"millieba/webdev-project2"},{"nameWithOwner":"millieba/TDT4225-project2"},{"nameWithOwner":"millieba/notes"},{"nameWithOwner":"millieba/tdt4240-exercise-1"},{"nameWithOwner":"millieba/tdt4240-exercise1"},{"nameWithOwner":"Simenkbj/GunsNGrains"},{"nameWithOwner":"millieba/tdt4240-exercise2"},{"nameWithOwner":"JoakimAustvold/WordleBattle"},{"nameWithOwner":"millieba/affirMe"},{"nameWithOwner":"millieba/tdt4173-task1"},{"nameWithOwner":"millieba/millieba"},{"nameWithOwner":"millieba/tdt4173-project"},{"nameWithOwner":"millieba/master-preparatory-project"},{"nameWithOwner":"karenvi/it3023-statistics"},{"nameWithOwner":"millieba/glow-getter"},{"nameWithOwner":"millieba/obsidian-vault"},{"nameWithOwner":"millieba/it3023-project"},{"nameWithOwner":"gaustad/Test1"},{"nameWithOwner":"gaustad/TestPriv"},{"nameWithOwner":"karenvi/testerepo"}]

    const inCommon: string[] = [];
    const different: string[] = [];
    const compareToNames = compareTo.map(obj => obj.nameWithOwner);
    const inputObjNames = inputObj.map((obj: { nameWithOwner: any; }) => obj.nameWithOwner);
    compareToNames.forEach(name => {
        if (inputObjNames.includes(name)) {
            inCommon.push(name);
        } else {
            different.push(name);
        }
    });
    inputObjNames.forEach((name: string) => {
        if (!compareToNames.includes(name)) {
            different.push(name);
        }
    });
    console.log("In common", inCommon);
    console.log("Different", different);
    return true;
}

export default comparer;