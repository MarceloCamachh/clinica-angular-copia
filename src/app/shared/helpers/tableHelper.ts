import { PageRequestResponseData } from '../models/PageRequestResponseData';

export class TableHelper {
  private _baseColumnTitles: string[] = [];

  get baseColumnTitles(): string[] {
    return this._baseColumnTitles;
  }

  set baseColumnTitles(value: string[]) {
    this._baseColumnTitles = value;
  }

  private _allColumnNames: string[] = [];

  public get allColumnNames(): string[] {
    return this._allColumnNames;
  }

  set allColumnNames(value: string[]) {
    this._allColumnNames = value;
  }

  private _baseColumnNames: string[] = [];

  get baseColumnNames(): string[] {
    return this._baseColumnNames;
  }

  set baseColumnNames(value: string[]) {
    this._baseColumnNames = value;
  }

  nestedPropertyAccessor(item: any, path: string): any {
    const value = path
      .split('.')
      .reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), item);

    if (!value) return value;

    // Si es una fecha
    if (value instanceof Date) {
      return value;
    }

    // Si es un array de tiempo [hora, minuto]
    if (Array.isArray(value) && value.length === 2) {
      return `${String(value[0]).padStart(2, '0')}:${String(value[1]).padStart(2, '0')}`;
    }

    return value;
  }

  setBaseColumnNames(columns: string[]): void {
    this._baseColumnNames = columns;
    this._allColumnNames = columns;
  }

  setAllColumnNames(additionalColumns: string[]): void {
    this._allColumnNames = [...this._baseColumnNames, ...additionalColumns];
  }

  setSpecifiedBaseColumnNamesFromRequestData(
    requestResponseData: PageRequestResponseData<any>,
    includeColumns: string[] = [],
    keyColumnMapping: { [key: string]: string } = {},
  ): void {
    const keysAndTitles = this.getSpecifiedKeys(
      requestResponseData.content[0],
      includeColumns,
      keyColumnMapping,
    );
    this._baseColumnNames = keysAndTitles.map(item => item.key);
    this._baseColumnTitles = keysAndTitles.map(item => item.title);
    this._allColumnNames = this._baseColumnNames;
  }

  private getSpecifiedKeys(
    obj: { [key: string]: any },
    includeList: string[] = [],
    keyColumnMapping: { [key: string]: string } = {},
    parentKey: string = '',
  ): Array<{ key: string; title: string }> {
    return Object.keys(obj).reduce(
      (acc: Array<{ key: string; title: string }>, key: string) => {
        const fullKey = [parentKey, key].filter(Boolean).join('.');

        if (includeList.includes(fullKey)) {
          const columnName = keyColumnMapping[fullKey] || fullKey;
          acc.push({ key: fullKey, title: columnName });
        }

        if (
          typeof obj[key] === 'object' &&
          obj[key] !== null &&
          !(obj[key] instanceof Date) &&
          !Array.isArray(obj[key])
        ) {
          const nestedKeys = this.getSpecifiedKeys(
            obj[key],
            includeList,
            keyColumnMapping,
            fullKey,
          );
          acc = [...acc, ...nestedKeys];
        }
        return acc;
      },
      [],
    );
  }
}
