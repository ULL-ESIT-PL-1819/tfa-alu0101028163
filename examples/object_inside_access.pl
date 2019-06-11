obj := object
        begin
          a := 1;
          procedure b();
          begin
            print(this.a);
          end
        end
        ;

  
call obj.b();