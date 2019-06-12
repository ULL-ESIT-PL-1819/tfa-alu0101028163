obj := object
        begin
          a := 2;
        end
        ;
obj2 := object extends obj
        begin
          x := 1;
        end
        ;
  
obj2.a := 1;

print(obj);
print(obj2);