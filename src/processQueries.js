const table = {
	columnsNames: [],
	rows: []
};

const commands = {
	select: selectRowWhere,
	create: createTable,
	insert: insertInto,
	delete: deleteWhere,
	update: updateToWhere
};

export default function processQuery(query){
	const com = query.substring(0, 6).toLowerCase();
	let params = "";
	
	for(let c of query){
		if(c === '[') break;
		query = query.substr(1);
	}

	try{
		params = JSON.parse(query);
	}catch(e){
		console.log(e);
	}
	return commands[com](params);
}

function getColumnIndex(column){
	const colIndex = table.columnsNames.findIndex(col => col === column);
	return colIndex;
}

function getRowIndex(value){
	const rowIndex = table.rows.findIndex(row => row.some(cell => cell === value));
	return rowIndex;
}

function thisColumnExists(column){
	try{
		const exists = table.columnsNames.some(col => col === column);
		return exists ? true : false;
	}catch(err){
		console.log("checkColumnError: "+err);
	}
}

function thisDatumExists(datum){
	try{
		const exists = table.rows.some(row => row.some(cell => cell === datum));
		return exists ? true : false;
	}catch(err){
		console.log("checkDatumError: "+err);
	}
}

async function selectRowWhere([col, val]){
	try{
		const thereIsThisColumn = await thisColumnExists(col);
		const thereIsThisValue = await thisDatumExists(val);

		if(thereIsThisColumn && thereIsThisValue){
			const rowIndex = getRowIndex(val);
			return { response: table.rows[rowIndex]}
		}else{
			return { error: "Informação inexistente" }
		}
	}catch(err){
		console.log("SelectError: "+err);
	}
}

function createTable(columnsArray){
	table.columnsNames = columnsArray;
	return { columns: table.columnsNames };
}

function insertInto(valuesArray){
	table.rows.push(valuesArray);
	return { rows: table.rows };
}

async function deleteWhere([col, val]){
	try{
		const thereIsThisColumn = await thisColumnExists(col);
		const thereIsThisValue = await thisDatumExists(val);

		if(thereIsThisColumn && thereIsThisValue){
			const rowIndex = getRowIndex(val);
			table.rows = table.rows.filter((row, index) => index !== rowIndex);
			console.log("rows: "+table.rows);
			return { rows: table.rows };
		}else{
			return { error: "Informação inexistente" }
		}
	}catch(err){
		console.log("DeleteError: "+err);
	}
}

async function updateToWhere([col, newValue, actualValue]){
	try{
		const thereIsThisColumn = await thisColumnExists(col);
		const thereIsThisValue = await thisDatumExists(actualValue);
		
		if(thereIsThisColumn && thereIsThisValue){
			const [colIndex, rowIndex] = [getColumnIndex(col), getRowIndex(actualValue)];
			table.rows[rowIndex][colIndex] = newValue;
			console.log("updateToWhere: "+table.rows);
			return { updated: table.rows };
		}else{
			return { error: "Informação inexistente" };
		}
	}catch(err){
		console.log("UpdateError: "+err);
	}
}
