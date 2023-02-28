interface Response{
    token: string;
    user: {
        name: string;
        email: string;
    };
}


export function signIn(): Promise<Response>{
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                token: 'klsjdhfklsdafsdkljfhsdfjkdso8743rkjdwshlrfkd',
                user: {
                    name: 'thiago',
                    email: 'thiago@gmail.com'
                }
            })
        }, 5000)
    })
}