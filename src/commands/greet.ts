import type { Arguments, CommandBuilder } from 'yargs';




export const command: string = 'get <address>';
export const desc: string = 'Query <address>\'s ABI';

import axios, { AxiosResponse } from "axios"

const Table = require('cli-table')
const serializeParams = (it: any, ctx: any) => it.map((it: any) => `${it.name || ''}:${it.type}`).join('\n')

// String.prototype.capitalize = function () {
//     return this.charAt(0).toUpperCase() + this.slice(1)
// }

Table.prototype.getData = function () {
    return this.slice(0)
}

// Table.prototype.getDataObject = function () {
//     return this.slice(0).map((it:) => _.object(this.getHead(), it))
// }

Table.prototype.getHead = function () {
    return this.options.head
}
const getAbiTableData = (abi: any) => {
    const rows: any = []
    let head = [
        'idx',
        '?',
        'name',
        'type',
        // "const",
        // 'payable',
        'len',
        'inputs',
        'outputs',
        'stateMutability',
        'signature',
    ]

    const indexedFuncs = {}
    for (const [idx, func] of Object.entries(abi).slice(0)) {
        // indexedFuncs[func.name] = Object.assign({}, func)
    }

    //     func.inputs = func.inputs || []
    //     func.outputs = func.outputs || []
    //     func.name = func.name || ''
    //     func.stateMutability = func.stateMutability || ''
    //     func.isInConstructor = isInConstructor(abi, func.name)

    //     const row = [
    //         idx,
    //         func.isInConstructor,
    //         func.name,
    //         func.type,
    //         // func.constant || "",
    //         // func.payable || '',
    //         func.inputs.length,
    //         serializeParams(func.inputs, func),
    //         serializeParams(func.outputs, func),
    //         func.stateMutability,
    //         func.signature || '',
    //     ]

    //     rows.push(row)
    // }

    const methodsTable = new Table({ head, rows })

    return {
        indexedFuncs,
        table: methodsTable,
    }
}

async function getAbi({ BSCSCAN_URL, address }: any) {
    const Conf = require('conf');
    const config = new Conf();
    let cacheKey = `${BSCSCAN_URL}${address}`.toLowerCase()
    let cache = config.get(cacheKey)

    if (cache) {
        return cache
    }

    const url = `${BSCSCAN_URL}&action=getabi&address=${address}`
    const httpResult: AxiosResponse = await axios.get(url)

    type AbiResponse = {
        result: string,
        status: string,
        message: string,
    }

    if (httpResult.status !== 200) {
        throw new Error(`${httpResult.status} ${httpResult.statusText}`)
    }
    else {
        const abi: AbiResponse = httpResult.data as AbiResponse
        if (abi.status === '1') {
            const out = JSON.parse(abi.result)
            config.set(cacheKey, out)
            return out
        }
        else {
            throw new Error(`${abi.status} ${abi.message}`)
        }
    }
}

type Options = {
    address: string;
    table: boolean | undefined;
};

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            table: { type: 'boolean' },
        })
        .positional('address', { type: 'string', demandOption: true });

export const handler = (argv: Arguments<Options>): void => {
    const { address, table }: Options = argv;
    console.log(table, address)

    getAbi({
        BSCSCAN_URL: 'https://api.bscscan.com/api?module=contract',
        address
    }).then(abi => {
        console.log(abi)
    })
};

// handler({ address: '0x3c0Bba9a0b4D920e2d1809D5952b883ABeEa6B5b', table: true } as Arguments<Options>)