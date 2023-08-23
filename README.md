<h1>Xử lý Form_Validate </h1>

<h4>Các rule hiện có:</h4>
<ol>
     <li> required</li>
     <li> email</li>
     <li>min --> Cần truyền tham số có trá trị min ký tự</li>
     <li>max --> Cần truyền tham số có trá trị max ký tự</li>
     <li>confirmed --> Cần truyền vào tham số là id ( id là thẻ input cần check giá trị với ô input đang nhập)</li>
</ol>
<h4>Cách sử dụng:</h4>
<ul>
  <li>
    Đặt atributes rules trong thẻ input  <br>
    VD: input id="avatar" name="avatar" type="file" class="form-control" rules="required"
  </li>
  <li>
  Khi có 2 rule trở lên thì sẽ được ngăn cách bởi dấu '|' <br>
  VD: input id="email" name="email" rules="required|email" type="text" placeholder="VD: email@domain.com" class="form-control"
  </li>
  <li>
  Nếu muốn custom message thì thêm dấu phẩy vào sau rule<br>
  VD: input id="email" name="email" rules="email,'Vui lòng không để trống email'" type="text"
  </li>
  <li>
  Đối với các rule nhận giá trị để check thì giá trí sẽ được đặt sau dấu ':'<br>
  VD: input id="password" name="password" rules="required|min:6" type="password"
  </li>
  <li>
  Có thể vừa thêm giá trị vừa custom message <br>
  VD: input id="password" name="password" rules="min:6,'Vui lòng nhập tối thiểu 6 ký tự'" type="password"
  </li>
  
</ul>
  ** Lưu ý:
    <li>Các thẻ input phải được đặt id </li>
    <li>Đối với 'radio' và 'checkbox' thì cần phải có name và rule phải được đặt trong từng thẻ input <br>
      VD: <br>
            input type="radio" name="gender" value="Male" rules="required" <br>
            input type="radio" name="gender"  value="Female" rules="required" <br>
            input type="radio" name="gender"  value="other" rules="required" </li> 
    <li>Đối với 'radio' và 'checkbox' thì chức năng custom message chưa được tối ưu hóa, nếu muốn custom message thì phải đặt dấu ',' vào tất cả rules trong thẻ input
</li>
