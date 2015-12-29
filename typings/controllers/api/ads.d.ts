interface IAd {
    type: number, link: string, title: string,
    description: string, media?: string,
    payType?: number, cost?: number,
    score?: number, id?: number
}

interface IPub {
    type: number, categories: string, keywords: string, site: string
}

interface IRequestQuery {
    pubid: number, xadid?: string, type?: number, types?: string,
    count?: number, speed?: number, ip?: string, age?: number,
    gender?: number, categories?: string, keywords?: string,
    test?: string
}

interface IUser {
    country: string, region: string, age?: number, gender?: number
}

interface IAdsRow {
    ad_media: string, ut_age: string, ut_countries: string, ct_keywords: string,
    pay_type: number, cost: number, available: string, ad_type: number,
    ut_regions: string, ut_genders: string, ct_categories: string,
    ad_title: string, ad_description: string, id: number
}