import type { Arguments, CommandBuilder } from 'yargs';
import { AbiInput, AbiItem } from 'web3-utils'


export const command: string = 'get <address>';
export const desc: string = 'Query <address>\'s ABI';

import axios, { AxiosResponse } from "axios"

const Table = require('cli-table3')
const serializeParams = (it: any, ctx: any) => it.map((it: any) => `${it.name || ''}:${it.type}`).join('\n')


Table.prototype.getData = function () {
    return this.slice(0)
}

Table.prototype.getHead = function () {
    return this.options.head
}

const isInConstructor = (abi: AbiItem[], funcName: string): string => {
    return abi[0]?.inputs?.map((params: AbiInput) => params.name).indexOf(`_${funcName}`) !== -1 ? '✓' : ''
}

type MyAbi = AbiItem & {
    isInConstructor: string
    signature: string
}

const getAbiTableData = (abi: MyAbi[]) => {
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

    const table = new Table({ head })
    const indexedFuncs = {} as any

    for (const [idx, func] of Object.entries(abi).slice(0)) {
        indexedFuncs[func.name || ''] = Object.assign({}, func)
        func.inputs = func.inputs || []
        func.outputs = func.outputs || []
        func.name = func.name || ''
        // x.stateMutability = func.stateMutability || ''
        func.isInConstructor = isInConstructor(abi, func?.name || "")
        const row = [
            idx,
            func.isInConstructor,
            func.name,
            func.type,
            func.inputs.length,
            serializeParams(func.inputs, func),
            serializeParams(func.outputs, func),
            // x.constant || "xx",
            // x.payable || 'yy',
            func.stateMutability,
            // x.signature || 'zz',
            func.signature,
        ]

        table.push(row)
    }

    return {
        indexedFuncs,
        table: table,
    }
}

const Conf = require('conf');
const config = new Conf();

async function getAbi({ BSCSCAN_URL, address }: any) {
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

    getAbi({
        BSCSCAN_URL: 'https://api.bscscan.com/api?module=contract',
        address
    }).then(abi => {
        if (table) {
            const { table, indexedFuncs } = getAbiTableData(abi)
            console.log(table.toString())
        }
        else {
            console.log(JSON.stringify(abi, null, 2))
        }
    })
};
