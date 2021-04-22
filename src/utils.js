export const stringToDate = str => {
  if (str === '*') {
    return new Date(str);
  }

  const [month, year] = str.split('-');
  return new Date(`${month} 1 20${year}`);
}

export const dateToString = d => {
  if (isNaN(d.valueOf())) {
    return '*';
  }

  const [_, month, __, year] = d.toString().split(' ');
  return `${month.toUpperCase()}-${year.slice(2, 4)}`
}

export const parseCSV = str => {
  let [headers, ...lines] = str.split(';\n');

  headers = headers.split(';');

  return lines.map(line => {
    return line
      .split(';')
      .reduce((acc, value, i) => {
        if (['ACCOUNT', 'DEBIT', 'CREDIT'].includes(headers[i])) {
          acc[headers[i]] = parseInt(value, 10);
        } else if (headers[i] === 'PERIOD') {
          acc[headers[i]] = stringToDate(value);
        } else {
          acc[headers[i]] = value;
        }
        return acc;
      }, {});
  });
}

export const toCSV = arr => {
  let headers = Object.keys(arr[0]).join(';');
  let lines = arr.map(obj => Object.values(obj).join(';'));
  return [headers, ...lines].join(';\n');
}

export const parseUserInput = str => {
  const [
    startAccount, endAccount, startPeriod, endPeriod, format
  ] = str.split(' ');

  return {
    startAccount: parseInt(startAccount, 10),
    endAccount: parseInt(endAccount, 10),
    startPeriod: stringToDate(startPeriod),
    endPeriod: stringToDate(endPeriod),
    format
  };
}


export const filterByCriterias = (journalEntries, userInput, accounts) => {

  let balance = []

  var { startAccount, endAccount, startPeriod, endPeriod } = userInput

  // MAKING IT AS EASY AS POSIBLE TO FILTER
  // Trying to save conditions
  startAccount = startAccount ? startAccount : -99999999
  endAccount = endAccount ? endAccount : 99999999

  // Min date possible
  startPeriod = startPeriod && startPeriod.getTime() ? startPeriod : new Date(-8640000000000000)
  // Max date possible
  endPeriod = endPeriod && endPeriod.getTime() ? endPeriod : new Date(8640000000000000)


  journalEntries.map(journal => {
    const { ACCOUNT, DEBIT, CREDIT, PERIOD } = journal

    const account = accounts.find(account => account.ACCOUNT === ACCOUNT)

    if (!account) return


    // Making it simple
    if (!(ACCOUNT >= startAccount && ACCOUNT <= endAccount))
      return

    if (!(PERIOD >= startPeriod && PERIOD <= endPeriod))
      return

    let balanceIndex = balance.findIndex(balance => balance.ACCOUNT === ACCOUNT)


    if (balanceIndex > -1) {
      balance[balanceIndex].CREDIT += CREDIT
      balance[balanceIndex].DEBIT += DEBIT
      balance[balanceIndex].BALANCE = balance[balanceIndex].DEBIT - balance[balanceIndex].CREDIT
    } else {
      balance.push({
        ACCOUNT,
        DEBIT,
        CREDIT,
        BALANCE: DEBIT - CREDIT,
        DESCRIPTION: account.LABEL
      })
    }
  })

  return balance
}