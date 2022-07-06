

it('testing ', async() => {

    const arrays = ['abceds-1234', 'zxcvb-09887'];
    let string = `('${arrays.join("','")}')`;


    expect(string).toBe(`('abceds-1234','zxcvb-09887')`);
    
});