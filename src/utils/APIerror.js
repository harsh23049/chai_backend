// APIerror.js ise ham isliye bana rahe hai taki ham apne controllers me jab bhi koi error throw karna ho to ham is class ka use kar sake aur apne error ko standard format me return kar sake frontend ko
// isse ham apne code me consistency la sakte hai aur error handling ko bhi improve kar sakte hai
//` APIerror class ko ham apne controllers me use karenge jab bhi koi error throw karna ho taki ham apne error ko standard format me return kar sake frontend ko
class APIerror extends Error {
    constructor(statusCode,
        message="something went wrong",
        errors=[],
        stack=""
    ){
        super(message);
        this.statusCode=statusCode;
        this.message=message;
        this.data=null;
        this.sucess=false;
        this.errors=this.errors;
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

export {APIerror}